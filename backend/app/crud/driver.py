"""crud/driver.py — Driver & Vehicle CRUD."""
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.driver import Driver, Vehicle, DriverStatus
from app.schemas.driver import DriverCreate, DriverUpdate, VehicleCreate, VehicleUpdate


class CRUDDriver(CRUDBase[Driver, DriverCreate, DriverUpdate]):

    def get_by_user(self, db: Session, user_id: int) -> Driver | None:
        return db.query(Driver).filter(Driver.user_id == user_id).first()

    def get_by_recycler(self, db: Session, recycler_id: int, *,
                        skip: int = 0, limit: int = 50) -> list[Driver]:
        return (db.query(Driver)
                .filter(Driver.recycler_id == recycler_id)
                .offset(skip).limit(limit).all())

    def get_available(self, db: Session, recycler_id: int | None = None) -> list[Driver]:
        q = db.query(Driver).filter(Driver.status == DriverStatus.available)
        if recycler_id:
            q = q.filter(Driver.recycler_id == recycler_id)
        return q.all()

    def set_availability(self, db: Session, driver_id: int, available: bool) -> Driver | None:
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if driver:
            driver.status = DriverStatus.available if available else DriverStatus.off_duty
            db.commit()
            db.refresh(driver)
        return driver


class CRUDVehicle(CRUDBase[Vehicle, VehicleCreate, VehicleUpdate]):

    def get_by_driver(self, db: Session, driver_id: int) -> list[Vehicle]:
        return db.query(Vehicle).filter(Vehicle.driver_id == driver_id).all()

    def get_by_recycler(self, db: Session, recycler_id: int) -> list[Vehicle]:
        return db.query(Vehicle).filter(Vehicle.recycler_id == recycler_id).all()

    def get_by_plate(self, db: Session, plate: str) -> Vehicle | None:
        return db.query(Vehicle).filter(Vehicle.plate_number == plate).first()


crud_driver = CRUDDriver(Driver)
crud_vehicle = CRUDVehicle(Vehicle)
