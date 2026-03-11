"""services/assignment_service.py
Auto-assignment of waste-collection locations to the nearest available driver.

Algorithm
---------
1.  For every unassigned, geo-coded collection in a recycler's queue, calculate
    the geodesic distance (Haversine formula, metres) to every available driver
    that has current GPS coordinates.
2.  Assign the nearest driver greedily.
3.  Optional load-balancing mode adds a small penalty per already-assigned
    location, so that the workload is spread more evenly across drivers.
4.  If `apply=True` the assignments are written back to the database.

No third-party geo library is required – the standard `math` module is used.
"""
from __future__ import annotations

import math
from typing import NamedTuple

from sqlalchemy.orm import Session

# ── Constants ──────────────────────────────────────────────────────────────────
EARTH_RADIUS_M = 6_371_000          # WGS-84 mean radius in metres
BALANCE_PENALTY_M = 500.0           # extra "virtual metres" per assigned location
CLUSTER_RADIUS_M  = 2_000.0         # stops within 2 km are treated as one cluster
SAME_LOCATION_RADIUS_M = 1_200.0    # driver already around destination
NEARBY_RADIUS_M = 5_000.0           # nearby zone for balancing
STARTED_NEARBY_RADIUS_M = 4_000.0   # started-route locality window


# ── Pure data types (no DB, easy to unit-test) ─────────────────────────────────

class LocationPoint(NamedTuple):
    """A waste-collection location with an internal reference id."""
    id: int
    lat: float
    lng: float
    label: str = ""


class CollectorPoint(NamedTuple):
    """A waste collector (driver) with a current position."""
    id: int
    lat: float
    lng: float
    label: str = ""


class AssignmentResult(NamedTuple):
    location_id: int
    location_lat: float
    location_lng: float
    location_label: str
    collector_id: int
    collector_lat: float
    collector_lng: float
    collector_label: str
    distance_m: float       # straight-line geodesic distance in metres
    workload: int           # total locations assigned to this collector so far


# ── Core distance function ─────────────────────────────────────────────────────

def haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return the geodesic (great-circle) distance in **metres** between two
    WGS-84 coordinate pairs using the Haversine formula.

    Accuracy is within ~0.3 % for distances relevant to urban logistics.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)

    a = (math.sin(dphi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2)
    return 2 * EARTH_RADIUS_M * math.asin(math.sqrt(a))


# ── Pure assignment algorithm ──────────────────────────────────────────────────

def assign_nearest(
    locations: list[LocationPoint],
    collectors: list[CollectorPoint],
    *,
    balance_load: bool = False,
) -> list[AssignmentResult]:
    """Assign each location to the nearest collector.

    Parameters
    ----------
    locations:
        Waste-collection stops that need a driver.
    collectors:
        Available drivers with known GPS positions.
    balance_load:
        When *True* a soft workload-balance heuristic is applied: each
        already-assigned location adds ``BALANCE_PENALTY_M`` (500 m) to the
        effective distance for that collector.  This spreads assignments more
        evenly while still honouring proximity.

    Returns
    -------
    list[AssignmentResult]
        One result per location, in the same order as *locations*.

    Raises
    ------
    ValueError
        If *collectors* is empty.
    """
    if not collectors:
        raise ValueError(
            "No collectors with GPS coordinates available for assignment."
        )
    if not locations:
        return []

    workload: dict[int, int] = {c.id: 0 for c in collectors}
    results: list[AssignmentResult] = []

    for loc in locations:
        best: CollectorPoint | None = None
        best_score = math.inf

        for col in collectors:
            raw_dist = haversine_m(loc.lat, loc.lng, col.lat, col.lng)
            score = (
                raw_dist + workload[col.id] * BALANCE_PENALTY_M
                if balance_load
                else raw_dist
            )
            if score < best_score:
                best_score = score
                best = col

        assert best is not None  # guaranteed because collectors is non-empty
        workload[best.id] += 1
        results.append(
            AssignmentResult(
                location_id=loc.id,
                location_lat=loc.lat,
                location_lng=loc.lng,
                location_label=loc.label,
                collector_id=best.id,
                collector_lat=best.lat,
                collector_lng=best.lng,
                collector_label=best.label,
                distance_m=haversine_m(loc.lat, loc.lng, best.lat, best.lng),
                workload=workload[best.id],
            )
        )

    return results


# ── Greedy geographic clustering ───────────────────────────────────────────────

def cluster_locations(
    locations: list[LocationPoint],
    radius_m: float = CLUSTER_RADIUS_M,
) -> list[list[LocationPoint]]:
    """Group locations that are within *radius_m* of each other into clusters.

    Uses a simple greedy approach:
    - The first unvisited point seeds a new cluster.
    - Every other unvisited point within *radius_m* of the cluster centroid
      is added to that cluster and the centroid is updated.
    - Equivalent to single-pass k-means with a distance gate.

    Returns a list-of-lists (each sub-list is one cluster).
    """
    if not locations:
        return []

    remaining = list(locations)
    clusters: list[list[LocationPoint]] = []

    while remaining:
        seed = remaining.pop(0)
        cluster = [seed]
        c_lat = seed.lat
        c_lng = seed.lng

        still_remaining: list[LocationPoint] = []
        for pt in remaining:
            if haversine_m(c_lat, c_lng, pt.lat, pt.lng) <= radius_m:
                cluster.append(pt)
                # Update centroid
                n = len(cluster)
                c_lat = (c_lat * (n - 1) + pt.lat) / n
                c_lng = (c_lng * (n - 1) + pt.lng) / n
            else:
                still_remaining.append(pt)
        remaining = still_remaining
        clusters.append(cluster)

    return clusters


def assign_clusters(
    locations: list[LocationPoint],
    collectors: list[CollectorPoint],
    *,
    balance_load: bool = True,
    cluster_radius_m: float = CLUSTER_RADIUS_M,
) -> list[AssignmentResult]:
    """Cluster nearby locations then assign each cluster to its nearest driver.

    Stops within *cluster_radius_m* metres of each other are grouped and
    assigned to the **same** driver.  Within a cluster the driver is chosen
    by proximity to the cluster centroid (with optional workload balancing).

    Returns one :class:`AssignmentResult` per *location* (not per cluster).
    """
    if not collectors:
        raise ValueError("No collectors available for assignment.")
    if not locations:
        return []

    clusters = cluster_locations(locations, radius_m=cluster_radius_m)
    workload: dict[int, int] = {c.id: 0 for c in collectors}
    results: list[AssignmentResult] = []

    for cluster in clusters:
        # Centroid of this cluster
        c_lat = sum(p.lat for p in cluster) / len(cluster)
        c_lng = sum(p.lng for p in cluster) / len(cluster)

        # Pick the best driver for this cluster
        best: CollectorPoint | None = None
        best_score = math.inf
        for col in collectors:
            raw_dist = haversine_m(c_lat, c_lng, col.lat, col.lng)
            score = (
                raw_dist + workload[col.id] * BALANCE_PENALTY_M
                if balance_load
                else raw_dist
            )
            if score < best_score:
                best_score = score
                best = col

        assert best is not None
        workload[best.id] += len(cluster)

        # Emit one result per location in the cluster
        for loc in cluster:
            results.append(
                AssignmentResult(
                    location_id=loc.id,
                    location_lat=loc.lat,
                    location_lng=loc.lng,
                    location_label=loc.label,
                    collector_id=best.id,
                    collector_lat=best.lat,
                    collector_lng=best.lng,
                    collector_label=best.label,
                    distance_m=haversine_m(loc.lat, loc.lng, best.lat, best.lng),
                    workload=workload[best.id],
                )
            )

    return results


# ── DB-integrated auto-assignment ──────────────────────────────────────────────

def auto_assign_collections(
    db: Session,
    *,
    recycler_id: int,
    balance_load: bool = False,
    apply: bool = False,
) -> list[dict]:
    """Query the DB for unassigned collections and available drivers, run the
    assignment algorithm, and optionally persist the results.

    Parameters
    ----------
    db:
        Active SQLAlchemy session.
    recycler_id:
        Only collections and drivers belonging to this recycler are considered.
    balance_load:
        Forward to :func:`assign_nearest`.
    apply:
        If *True*, write the driver assignments back to the database.

    Returns
    -------
    list[dict]
        JSON-serialisable list describing each assignment::

            {
              "collection_id": 42,
              "location": {
                "lat": -1.94, "lng": 30.06,
                "label": "Kigali Serena Hotel",
                "waste_type": "UCO", "volume": 120.0
              },
              "assigned_driver": {
                "id": 7, "name": "Jean Bosco",
                "lat": -1.95, "lng": 30.07,
                "status": "available",
                "vehicle_type": "Truck", "plate_number": "RAB 123A"
              },
              "distance_m": 1423.5,
              "workload": 2
            }
    """
    # Lazy imports to avoid circular dependencies
    from app.models.collection import Collection, CollectionStatus
    from app.models.driver import Driver, DriverStatus
    from app.models.user import User as _User

    # ── 1. All unassigned scheduled collections (geo-coded or not) ────────────
    unassigned: list[Collection] = (
        db.query(Collection)
        .filter(
            Collection.recycler_id == recycler_id,
            Collection.driver_id.is_(None),
            Collection.status == CollectionStatus.scheduled,
        )
        .all()
    )

    # ── 2. Available drivers — must have logged in (last_login not None) ───────
    _base_driver_filter = [
        Driver.recycler_id == recycler_id,
        Driver.status == DriverStatus.available,
        Driver.vehicle_id.isnot(None),
    ]
    drivers_with_gps: list[Driver] = (
        db.query(Driver)
        .join(Driver.user)
        .filter(
            *_base_driver_filter,
            Driver.current_lat.isnot(None),
            Driver.current_lng.isnot(None),
            _User.last_login.isnot(None),
        )
        .all()
    )
    # Fallback pool: available drivers with a vehicle but no GPS yet (but still logged in)
    drivers_no_gps: list[Driver] = (
        db.query(Driver)
        .join(Driver.user)
        .filter(
            *_base_driver_filter,
            Driver.current_lat.is_(None),
            _User.last_login.isnot(None),
        )
        .all()
    )
    available_drivers: list[Driver] = drivers_with_gps or drivers_no_gps

    # ── 3. Build pure data inputs ──────────────────────────────────────────────
    # Use listing coordinates when available; fall back to hotel coordinates
    def _col_coords(col: Collection) -> tuple[float, float] | None:
        if col.listing and col.listing.latitude and col.listing.longitude:
            return col.listing.latitude, col.listing.longitude
        if col.hotel and getattr(col.hotel, "latitude", None) and getattr(col.hotel, "longitude", None):
            return col.hotel.latitude, col.hotel.longitude
        return None

    geo_collections = [c for c in unassigned if _col_coords(c) is not None]
    ungeo_collections = [c for c in unassigned if _col_coords(c) is None]

    locations: list[LocationPoint] = [
        LocationPoint(
            id=col.id,
            lat=_col_coords(col)[0],  # type: ignore[index]
            lng=_col_coords(col)[1],  # type: ignore[index]
            label=(
                (col.listing.address if col.listing else None)
                or (col.hotel.name if col.hotel else None)
                or f"Collection #{col.id}"
            ),
        )
        for col in geo_collections
    ]

    # If drivers have GPS use distance-ranked assignment; otherwise round-robin
    use_gps = bool(drivers_with_gps)

    if use_gps:
        collectors: list[CollectorPoint] = [
            CollectorPoint(
                id=d.id,
                lat=d.current_lat,
                lng=d.current_lng,
                label=((d.user.full_name if d.user else None) or f"Driver #{d.id}"),
            )
            for d in drivers_with_gps
        ]
    else:
        # No GPS data — place all drivers at a shared dummy point so the
        # algorithm still runs and distributes work evenly via load-balancing.
        collectors = [
            CollectorPoint(
                id=d.id, lat=0.0, lng=0.0,
                label=((d.user.full_name if d.user else None) or f"Driver #{d.id}"),
            )
            for d in available_drivers
        ]

    # ── 4. Priority assignment strategy (location-first, then workload) ───────
    assignments: list[AssignmentResult] = []

    # Existing active workload per driver (already assigned collections).
    active_statuses = [
        CollectionStatus.scheduled,
        CollectionStatus.en_route,
        CollectionStatus.arrived,
        CollectionStatus.collected,
        CollectionStatus.verified,
    ]
    base_workload: dict[int, int] = {
        d.id: db.query(Collection)
        .filter(
            Collection.recycler_id == recycler_id,
            Collection.driver_id == d.id,
            Collection.status.in_(active_statuses),
        )
        .count()
        for d in available_drivers
    }
    planned_workload: dict[int, int] = {d.id: 0 for d in available_drivers}
    planned_points_by_driver: dict[int, list[tuple[float, float]]] = {
        d.id: [] for d in available_drivers
    }
    driver_by_id: dict[int, Driver] = {d.id: d for d in available_drivers}

    # Soft capacity guard so one driver is not overwhelmed.
    total_existing = sum(base_workload.values())
    total_expected = total_existing + len(unassigned)
    soft_capacity = max(1, math.ceil(total_expected / max(1, len(available_drivers))) + 1)

    def current_load(driver_id: int) -> int:
        return base_workload.get(driver_id, 0) + planned_workload.get(driver_id, 0)

    # For each driver, collect coords of already-started jobs to keep route locality.
    started_statuses = [
        CollectionStatus.en_route,
        CollectionStatus.arrived,
        CollectionStatus.collected,
        CollectionStatus.verified,
    ]
    started_jobs = (
        db.query(Collection)
        .filter(
            Collection.recycler_id == recycler_id,
            Collection.driver_id.isnot(None),
            Collection.status.in_(started_statuses),
        )
        .all()
    )
    started_coords_by_driver: dict[int, list[tuple[float, float]]] = {}
    for col in started_jobs:
        if not col.driver_id:
            continue
        coords = _col_coords(col)
        if not coords:
            continue
        started_coords_by_driver.setdefault(col.driver_id, []).append(coords)

    # Assign geo-coded collections one-by-one using required priority.
    for loc in locations:
        if not available_drivers:
            break

        # Fuel-saving rule: keep nearby pickups on the same driver whenever
        # this destination is close to an already planned destination.
        closest_cluster_driver_id: int | None = None
        closest_cluster_dist = math.inf
        for drv_id, pts in planned_points_by_driver.items():
            for pt_lat, pt_lng in pts:
                d_m = haversine_m(loc.lat, loc.lng, pt_lat, pt_lng)
                if d_m <= CLUSTER_RADIUS_M and d_m < closest_cluster_dist:
                    closest_cluster_dist = d_m
                    closest_cluster_driver_id = drv_id

        if closest_cluster_driver_id is not None:
            chosen = driver_by_id[closest_cluster_driver_id]
            dist_m = (
                haversine_m(loc.lat, loc.lng, chosen.current_lat, chosen.current_lng)
                if (chosen.current_lat is not None and chosen.current_lng is not None)
                else 0.0
            )
            planned_workload[chosen.id] = planned_workload.get(chosen.id, 0) + 1
            planned_points_by_driver[chosen.id].append((loc.lat, loc.lng))
            assignments.append(
                AssignmentResult(
                    location_id=loc.id,
                    location_lat=loc.lat,
                    location_lng=loc.lng,
                    location_label=loc.label,
                    collector_id=chosen.id,
                    collector_lat=chosen.current_lat or 0.0,
                    collector_lng=chosen.current_lng or 0.0,
                    collector_label=((chosen.user.full_name if chosen.user else None) or f"Driver #{chosen.id}"),
                    distance_m=0.0 if math.isinf(dist_m) else dist_m,
                    workload=current_load(chosen.id),
                )
            )
            continue

        def _distance_for(driver: Driver) -> float:
            if driver.current_lat is None or driver.current_lng is None:
                return math.inf
            return haversine_m(loc.lat, loc.lng, driver.current_lat, driver.current_lng)

        def _started_min_distance(driver: Driver) -> float:
            pts = started_coords_by_driver.get(driver.id, [])
            if not pts:
                return math.inf
            return min(haversine_m(loc.lat, loc.lng, la, ln) for la, ln in pts)

        def _within_capacity(candidates: list[Driver]) -> list[Driver]:
            under = [d for d in candidates if current_load(d.id) < soft_capacity]
            return under if under else candidates

        if use_gps:
            same_location = [d for d in available_drivers if _distance_for(d) <= SAME_LOCATION_RADIUS_M]
            nearby = [d for d in available_drivers if _distance_for(d) <= NEARBY_RADIUS_M]
            started_nearby = [
                d for d in available_drivers
                if _started_min_distance(d) <= STARTED_NEARBY_RADIUS_M
            ]
            zero_nearby = [d for d in nearby if current_load(d.id) == 0]
            zero_global = [d for d in available_drivers if current_load(d.id) == 0]

            started_nearby = _within_capacity(started_nearby)
            same_location = _within_capacity(same_location)
            zero_nearby = _within_capacity(zero_nearby)
            nearby = _within_capacity(nearby)
            zero_global = _within_capacity(zero_global)
            available_pool = _within_capacity(available_drivers)

            chosen: Driver
            # 1) If driver already has a started job near this destination, keep locality.
            if started_nearby:
                chosen = min(started_nearby, key=lambda d: (_started_min_distance(d), current_load(d.id), _distance_for(d)))
            # 2) If there is a driver in this exact location, prefer them.
            elif same_location:
                chosen = min(same_location, key=lambda d: (current_load(d.id), _distance_for(d)))
            # 3) If no local driver, check nearby driver with no assignments.
            elif zero_nearby:
                chosen = min(zero_nearby, key=lambda d: _distance_for(d))
            # 4) Else choose nearby driver with fewest assignments.
            elif nearby:
                chosen = min(nearby, key=lambda d: (current_load(d.id), _distance_for(d)))
            # 5) Fallback: any unassigned driver.
            elif zero_global:
                chosen = min(zero_global, key=lambda d: _distance_for(d))
            # 6) Last fallback: closest + least loaded globally.
            else:
                chosen = min(available_pool, key=lambda d: (current_load(d.id), _distance_for(d)))

            dist_m = _distance_for(chosen)
        else:
            # No GPS: distribute fairly by lowest active+planned workload.
            zero_global = [d for d in available_drivers if current_load(d.id) == 0]
            chosen = min(zero_global, key=lambda d: d.id) if zero_global else min(available_drivers, key=lambda d: (current_load(d.id), d.id))
            dist_m = 0.0

        planned_workload[chosen.id] = planned_workload.get(chosen.id, 0) + 1
        planned_points_by_driver[chosen.id].append((loc.lat, loc.lng))

        assignments.append(
            AssignmentResult(
                location_id=loc.id,
                location_lat=loc.lat,
                location_lng=loc.lng,
                location_label=loc.label,
                collector_id=chosen.id,
                collector_lat=chosen.current_lat or 0.0,
                collector_lng=chosen.current_lng or 0.0,
                collector_label=((chosen.user.full_name if chosen.user else None) or f"Driver #{chosen.id}"),
                distance_m=0.0 if math.isinf(dist_m) else dist_m,
                workload=current_load(chosen.id),
            )
        )

    # Round-robin assign collections without any coordinates to available drivers
    if ungeo_collections and available_drivers:
        workload_rr: dict[int, int] = {
            d.id: base_workload.get(d.id, 0) + planned_workload.get(d.id, 0)
            for d in available_drivers
        }
        for col in ungeo_collections:
            under_cap = [d for d in available_drivers if workload_rr[d.id] < soft_capacity]
            pool = under_cap if under_cap else available_drivers
            drv = min(pool, key=lambda d: workload_rr[d.id])
            assignments.append(
                AssignmentResult(
                    location_id=col.id,
                    location_lat=0.0, location_lng=0.0, location_label=f"Collection #{col.id}",
                    collector_id=drv.id,
                    collector_lat=drv.current_lat or 0.0,
                    collector_lng=drv.current_lng or 0.0,
                    collector_label=((drv.user.full_name if drv.user else None) or f"Driver #{drv.id}"),
                    distance_m=0.0,
                    workload=workload_rr[drv.id] + 1,
                )
            )
            workload_rr[drv.id] += 1

    # ── 5. Optionally persist ──────────────────────────────────────────────────
    if apply:
        from app.crud.collection import crud_collection
        for a in assignments:
            drv = next((d for d in available_drivers if d.id == a.collector_id), None)
            if drv:
                crud_collection.assign_driver(
                    db,
                    collection_id=a.location_id,
                    driver_id=drv.id,
                    vehicle_id=drv.vehicle_id,
                )

    # ── 6. Build JSON-safe response ────────────────────────────────────────────
    col_map = {col.id: col for col in unassigned}
    drv_map = {d.id: d for d in available_drivers}

    output: list[dict] = []
    for a in assignments:
        col = col_map.get(a.location_id)
        drv = drv_map.get(a.collector_id)
        output.append(
            {
                "collection_id": a.location_id,
                "location": {
                    "lat": a.location_lat,
                    "lng": a.location_lng,
                    "label": a.location_label,
                    "waste_type": (
                        col.listing.waste_type.value
                        if col and col.listing
                        else None
                    ),
                    "volume": (
                        col.listing.volume if col and col.listing else None
                    ),
                },
                "assigned_driver": {
                    "id": a.collector_id,
                    "name": a.collector_label,
                    "lat": a.collector_lat,
                    "lng": a.collector_lng,
                    "status": drv.status.value if drv else None,
                    "vehicle_type": (
                        drv.vehicle.vehicle_type
                        if (drv and drv.vehicle)
                        else None
                    ),
                    "plate_number": (
                        drv.vehicle.plate_number
                        if (drv and drv.vehicle)
                        else None
                    ),
                },
                "distance_m": round(a.distance_m, 1),
                "workload": a.workload,
            }
        )

    return output
