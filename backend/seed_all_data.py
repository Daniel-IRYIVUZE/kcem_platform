"""
seed_all_data.py — Comprehensive seed: blogs, collections, transactions, and enriched driver data.
Run from backend/ directory:  python seed_all_data.py
"""
import random
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.blog import BlogPost
from app.models.user import User, UserRole
from app.models.collection import Collection, CollectionStatus
from app.models.transaction import Transaction, TransactionStatus
from app.models.driver import Driver, Vehicle, DriverStatus, VehicleStatus
from app.models.listing import WasteListing, WasteType, ListingStatus
from app.models.hotel import Hotel
from app.models.recycler import Recycler

now = datetime.now(timezone.utc)


# ─── Blog Posts ───────────────────────────────────────────────────────────────

BLOG_POSTS = [
    {
        "title": "Rwanda's Journey to Becoming Africa's Green Leader",
        "slug": "rwanda-green-leader-africa",
        "category": "sustainability",
        "excerpt": "How Rwanda is transforming waste management and leading the continent in environmental conservation.",
        "content": """Rwanda has emerged as a beacon of environmental sustainability in Africa. Through innovative policies and strong government commitment, the nation has achieved remarkable progress in waste management and recycling.

The ban on plastic bags in 2008 was just the beginning. Today, Rwanda boasts one of the cleanest cities in Africa, with Kigali setting standards for urban environmental management.

**Key achievements include:**
- 90% waste collection coverage in urban areas
- Growing recycling industry creating thousands of jobs
- Integration of informal waste pickers into the formal economy
- Public-private partnerships driving innovation

The EcoTrade platform is part of this vision, connecting hotels, recyclers, and drivers to create a true circular economy for Rwanda.""",
        "tags": "rwanda,sustainability,green economy,waste management,africa",
        "is_published": True,
        "is_featured": True,
        "cover_image": "https://images.unsplash.com/photo-1473621038790-b778b4750efe?w=800",
    },
    {
        "title": "The Economic Value of Used Cooking Oil Recycling",
        "slug": "uco-value-recycling-biodiesel",
        "category": "recycling",
        "excerpt": "Discover how hotels can turn used cooking oil into a valuable commodity while protecting the environment.",
        "content": """Used Cooking Oil (UCO) is more than just waste — it is a valuable resource that can be converted into biodiesel, animal feed, and industrial products.

For hotels in Rwanda, proper UCO management offers multiple benefits:

**Economic Benefits:**
- Generate revenue from waste that was previously a disposal cost
- Typical prices range from 400–800 RWF per litre
- Large hotels can collect 200–500 litres monthly
- Annual revenue potential of 1–4 million RWF

**Environmental Benefits:**
- Prevent FOG (Fats, Oils, Grease) blockages in sewers
- Reduce water pollution and lower carbon emissions
- Each litre of UCO recycled saves 2.5 kg of CO₂

**Best Practices:**
- Use dedicated collection containers
- Filter out food particles before storage
- Store in cool, dry locations
- Schedule regular pickups through EcoTrade""",
        "tags": "UCO,biodiesel,cooking oil,recycling,energy",
        "is_published": True,
        "is_featured": True,
        "cover_image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    },
    {
        "title": "Hotel Inyange Kigali: A Case Study in Zero-Waste Operations",
        "slug": "hotel-inyange-zero-waste-case-study",
        "category": "case-study",
        "excerpt": "How Hotel Inyange Kigali achieved a 78% waste diversion rate using EcoTrade Rwanda.",
        "content": """Hotel Inyange Kigali set an ambitious target in 2024: divert 80% of operational waste from landfill within 12 months. Using EcoTrade Rwanda, they exceeded expectations.

**The Challenge:**
The hotel generates approximately 450 kg of waste daily — organic scraps, used cooking oil, glass, cardboard, and mixed plastics. Historically, 90% went to landfill.

**The Solution:**
By partnering with EcoTrade-certified recyclers, the hotel now:
- Sells 300 litres of UCO monthly at 600 RWF/litre
- Composts 200 kg of organic waste weekly
- Diverts 95% of cardboard and glass for recycling

**Results After 12 Months:**
- **78%** waste diversion rate (up from 10%)
- **RWF 2.4M** in annual revenue from waste
- **Green Score of 92/100** on EcoTrade
- **Zero** FOG-related plumbing incidents""",
        "tags": "case study,hotel,zero waste,kigali,recycling",
        "is_published": True,
        "is_featured": True,
        "cover_image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    },
    {
        "title": "Understanding Rwanda's Plastic Waste Regulations",
        "slug": "rwanda-plastic-waste-regulations-2025",
        "category": "news",
        "excerpt": "What the latest REMA regulations mean for hotels and hospitality businesses.",
        "content": """The Rwanda Environment Management Authority (REMA) has updated its regulations on single-use plastics effective January 2025. Here is what hospitality businesses need to know.

**Key Changes:**
1. Complete ban on single-use plastic bottles under 1 litre for events and in-room amenities
2. Mandatory waste segregation at source for all facilities over 50 rooms
3. Digital waste tracking required for properties with more than 100 guests per day
4. Annual environmental compliance audit for star-rated hotels

**Penalties:**
- First offence: written warning and 30-day compliance window
- Second offence: fines of RWF 500,000–2,000,000
- Third offence: temporary business closure

**How EcoTrade Helps:**
EcoTrade's digital platform automatically generates compliance reports, tracks waste volumes, and connects you with certified recyclers — making compliance effortless.""",
        "tags": "regulations,REMA,plastic,compliance,hotel",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
    },
    {
        "title": "Top 5 Waste Streams That Hotels Are Missing Revenue On",
        "slug": "hotel-waste-revenue-top-5-streams",
        "category": "sustainability",
        "excerpt": "Most hotels only monetize UCO. Here are five other waste streams worth significant revenue.",
        "content": """Most hotels focus on used cooking oil, but there are five additional waste streams that generate significant revenue when properly managed.

**1. Glass Bottles and Containers**
Bars and restaurants generate enormous quantities of glass. At 100 RWF/kg, a mid-size hotel can earn RWF 120,000/month from glass alone.

**2. Cardboard and Paper**
Delivery packaging, office paper, and kitchen boxes are high-value recyclables. Paper fetches 50–80 RWF/kg.

**3. Organic / Food Waste**
Composting programmes can turn kitchen waste into agricultural inputs, sold at RWF 150/kg to urban farmers.

**4. E-Waste**
Outdated TVs, laptops, and kitchen appliances contain valuable metals. Certified e-waste handlers pay 2,000–5,000 RWF per unit.

**5. Textiles and Linen**
Worn-out bed linen and towels can be sold to industrial rag suppliers at 200 RWF/kg.

**Combined Potential:** A 100-room hotel managing all five streams can generate **RWF 4–8 million per year** from waste alone.""",
        "tags": "revenue,hotel,waste,recycling,sustainability",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800",
    },
    {
        "title": "Meet the Recyclers: EcoRevive Rwanda's Impact Story",
        "slug": "ecorevive-rwanda-recycler-impact-story",
        "category": "case-study",
        "excerpt": "How EcoRevive Rwanda scaled from a small workshop to a 12-truck operation using EcoTrade.",
        "content": """EcoRevive Rwanda started in 2021 with one truck and two employees. Today they run a fleet of 12 vehicles and process over 50 tonnes of waste per month — and EcoTrade was central to their growth.

**The Journey:**
Founder Jean-Claude Habimana saw an opportunity: Kigali's hotels were paying to dispose of waste that had significant market value. But connecting with hotel buyers was difficult and inconsistent.

"With EcoTrade, we went from making three calls per week to getting five new bids per day," says Habimana.

**By the Numbers:**
- **12 trucks** in active fleet
- **50+ tonnes** of waste processed monthly  
- **RWF 85M** annual revenue
- **Green Score: 96/100**
- **Zero** missed collections in the last 6 months

**What Makes the Difference:**
Real-time bidding, digital contracts, and GPS tracking have eliminated the inefficiencies that plagued the informal sector. EcoRevive now forecasts demand three weeks out using EcoTrade's analytics.""",
        "tags": "recycler,case study,ecorevive,kigali,growth",
        "is_published": True,
        "is_featured": True,
        "cover_image": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
    },
    {
        "title": "How to Set Up a Waste Segregation Programme in Your Hotel",
        "slug": "hotel-waste-segregation-programme-guide",
        "category": "sustainability",
        "excerpt": "A practical step-by-step guide to setting up effective waste segregation at your property.",
        "content": """Waste segregation is the foundation of any effective recycling programme. Here is a practical guide for hotel managers.

**Step 1: Audit Your Waste**
Before buying a single bin, audit what waste you produce:
- Kitchen waste audit (every evening for two weeks)
- Bar waste audit
- Housekeeping waste audit
- Administrative waste audit

**Step 2: Create Waste Zones**
Designate separate areas for:
- Organic / food waste (green bins)
- Recyclables: glass, cardboard, metal (blue bins)
- Cooking oil (yellow containers)
- General waste (black bins)
- Hazardous / e-waste (red containers)

**Step 3: Train Your Team**
Run a 2-hour workshop. Focus on:
- Why segregation matters (revenue + environment)
- Which items go where
- How to avoid contamination

**Step 4: Connect with Recyclers**
Register on EcoTrade Rwanda and list your segregated waste streams. Certified recyclers will bid for each stream.

**Step 5: Track and Improve**
Use EcoTrade's dashboard to monitor monthly volumes, revenue, and your Green Score.""",
        "tags": "guide,waste segregation,hotel,practical,recycling",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800",
    },
    {
        "title": "Carbon Credits and Green Hotels: What Rwandan Businesses Need to Know",
        "slug": "carbon-credits-green-hotels-rwanda",
        "category": "sustainability",
        "excerpt": "Rwanda's emerging carbon market presents a new revenue opportunity for eco-conscious hotels.",
        "content": """Rwanda is developing its voluntary carbon market, presenting an exciting new revenue stream for hotels that actively reduce their environmental footprint.

**What Are Carbon Credits?**
One carbon credit represents one tonne of CO₂ equivalent prevented or removed. Businesses and individuals buy credits to offset their emissions.

**How Hotels Can Earn Credits:**
1. Switching from diesel generators to solar/wind
2. Composting organic waste instead of landfilling
3. Reducing plastic packaging in food & beverage
4. Installing energy-efficient LED lighting and HVAC

**Current Market Prices:**
- Voluntary carbon market: USD 5–25 per tonne CO₂e
- Rwanda biodiversity premiums: up to USD 40/tonne

**Getting Started:**
Hotels with an EcoTrade Green Score above 80 are eligible to apply for Rwanda's Green Hospitality Carbon Standard. Contact REMA or your EcoTrade account manager for details.""",
        "tags": "carbon credits,sustainability,green hotel,rwanda,environment",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800",
    },
    {
        "title": "EcoTrade Rwanda Platform Update: New Features in 2025",
        "slug": "ecotrade-platform-update-2025",
        "category": "news",
        "excerpt": "We've added GPS tracking, instant bid notifications, and downloadable green certificates.",
        "content": """EcoTrade Rwanda is excited to announce a major platform update rolling out across March–April 2025.

**New Features:**

🗺️ **Real-Time Driver GPS Tracking**
Hotels and recyclers can now track drivers live on a map as they approach for collection. No more waiting and wondering — you'll see the driver's ETA to the minute.

🔔 **Instant Bid Notifications**
When a recycler bids on your listing, you'll receive a push notification within seconds. Accept or counter-bid directly from your phone.

📜 **Downloadable Green Certificates**
Hotels with a Green Score of 80+ can now download official EcoTrade Green Certificates to display in lobbies and on websites.

📊 **Advanced Analytics Dashboard**
New charts showing waste diversion trends, revenue projections, and carbon savings over time.

🤳 **Mobile App (Beta)**
Download the new EcoTrade mobile app from Google Play or Apple App Store. Full functionality on any device.

These updates are available to all registered users at no additional cost.""",
        "tags": "news,platform update,features,2025,app",
        "is_published": True,
        "is_featured": True,
        "cover_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    },
    {
        "title": "Composting at Scale: Lessons from Gorilla Hills Resort",
        "slug": "composting-scale-gorilla-hills-resort",
        "category": "case-study",
        "excerpt": "How Gorilla Hills Resort turned 800 kg of weekly food waste into a profitable composting operation.",
        "content": """Gorilla Hills Resort in Rwanda's Musanze District generates approximately 800 kg of organic waste weekly. Two years ago, this was a cost. Today, it is a profit centre.

**The Project:**
In partnership with a local agricultural cooperative, Gorilla Hills installed a commercial composting system on a half-acre plot adjacent to the resort grounds.

**Operational Details:**
- 800 kg/week of organic waste inputs
- 3-week composting cycle
- Output: approximately 150 kg of finished compost per week
- Sold at RWF 200/kg to local farmers

**Financial Results:**
- Monthly revenue from compost: **RWF 1.2M**
- Reduction in waste disposal costs: **RWF 300,000/month**
- Total monthly benefit: **RWF 1.5M**
- Payback period on equipment: **14 months**

**Environmental Impact:**
- 41.6 tonnes of CO₂e avoided per year (from avoided landfill methane)
- Improved local soil quality for smallholder farmers
- Near-zero organic waste to landfill

Gorilla Hills now holds a **Green Score of 100/100** on EcoTrade — the highest rating on the platform.""",
        "tags": "composting,resort,case study,organic waste,gorilla hills",
        "is_published": True,
        "is_featured": True,
        "cover_image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    },
    {
        "title": "The Role of Female Entrepreneurs in Rwanda's Recycling Sector",
        "slug": "women-entrepreneurs-rwanda-recycling",
        "category": "sustainability",
        "excerpt": "Women are driving innovation in Rwanda's circular economy — meet five who are leading the way.",
        "content": """Rwanda consistently ranks among the world's leaders in female representation in business and government. The recycling sector is no exception.

**Marie Uwimana — GreenPath Solutions**
Marie founded GreenPath in 2020 with a focus on paper and cardboard recycling. Her company now employs 35 women and processes 8 tonnes of paper per month for export to Uganda.

**Consolata Mukamana — EcoClean Organics**
Consolata runs a composting operation supplying premium growing medium to flower farms in the Eastern Province. Her annual revenue exceeds RWF 18 million.

**Alice Mukarutabana — Tech Waste Rwanda**
Alice identified a gap in certified e-waste management. Her team of 15 safely dismantles and recovers materials from electronic devices, including laptops and phones.

**Why Women Are Leading:**
Research across multiple African countries shows that women-led enterprises in the circular economy tend to reinvest a higher proportion of revenue back into community health, education, and environment. Rwanda's supportive regulatory environment amplifies this effect.""",
        "tags": "women,entrepreneurs,recycling,rwanda,circular economy",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800",
    },
    {
        "title": "Metal Recycling Opportunities for Hospitality Businesses",
        "slug": "metal-recycling-hospitality-opportunities",
        "category": "recycling",
        "excerpt": "Aluminum cans, stainless steel, and copper piping all have strong markets — here is how to access them.",
        "content": """Metal recycling is one of the most environmentally impactful and financially rewarding waste streams for hotels and restaurants.

**Key Metal Waste Streams in Hospitality:**

**Aluminium Cans**
- Price: RWF 600–800/kg
- A busy hotel bar generates 50–80 kg monthly
- Monthly revenue potential: RWF 30,000–64,000

**Stainless Steel**
- Price: RWF 400–600/kg
- End-of-life kitchen equipment, pots, pans
- Major opportunity during kitchen renovations

**Copper Wiring and Plumbing**
- Price: RWF 2,500–4,000/kg
- Significant volumes during renovations
- Always use certified recyclers to avoid theft issues

**Glass and Tin Packaging**
- Tin cans: RWF 150/kg
- Glass: RWF 80–120/kg

**Finding Metal Recyclers:**
MetalPlus Recycling and similar EcoTrade-certified partners handle all these streams. List your metals on EcoTrade and receive competitive bids within 24 hours.""",
        "tags": "metal,recycling,aluminum,hotel,revenue",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    },
    {
        "title": "EcoTrade's Green Score: How It Works and Why It Matters",
        "slug": "ecotrade-green-score-explained",
        "category": "sustainability",
        "excerpt": "A deep dive into the Green Score algorithm and how to improve your rating.",
        "content": """EcoTrade's Green Score is a 0–100 rating that measures a hotel's environmental performance on the platform. Here is exactly how it is calculated.

**Score Components:**

| Factor | Weight | How to Maximise |
|---|---|---|
| Waste Diversion Rate | 30% | Complete more collections; fewer missed pickups |
| Collection Frequency | 25% | List waste regularly; maintain consistent schedules |
| Platform Engagement | 20% | Log in weekly, review bids, respond quickly |
| Environmental Impact | 25% | Higher-value waste types (UCO, metals) score more |

**Score Levels:**
- 0–39: Needs Improvement
- 40–59: Fair
- 60–79: Good
- 80–99: Excellent
- 100: Perfect 🏆

**Why It Matters:**
- Scores above 80 unlock downloadable Green Certificates
- Scores above 90 qualify for Rwanda's Green Hotel accreditation
- Recyclers see your score and offer better prices to high-scoring hotels

**Quick Wins:**
1. Complete all scheduled collections (biggest single impact)
2. List waste weekly rather than monthly
3. Add all waste types (not just UCO)
4. Respond to bids within 4 hours""",
        "tags": "green score,rating,sustainability,algorithm,hotels",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    },
    {
        "title": "Rwanda's Vision 2050: Green Growth and the Circular Economy",
        "slug": "rwanda-vision-2050-green-growth-circular-economy",
        "category": "news",
        "excerpt": "How Rwanda's long-term development strategy aligns with circular economy principles.",
        "content": """Rwanda's Vision 2050 sets a bold target: to become an upper-middle-income country with a green, knowledge-based economy by 2050. The circular economy is central to this vision.

**Circular Economy in Vision 2050:**
The strategy explicitly calls for:
- 80% of waste diverted from landfill by 2035
- A National Recycling Industry generating 30,000 jobs by 2040
- Rwanda to become a regional hub for sustainable packaging and e-waste processing

**Policy Enablers Already in Place:**
- Extended Producer Responsibility (EPR) legislation enacted 2023
- Green Bonds framework launched (Ministry of Finance, 2024)
- Rwanda Carbon Market Regulation (REMA, 2025)
- Sustainable Tourism Policy (RDB, 2024)

**Role of EcoTrade:**
EcoTrade Rwanda directly supports Vision 2050 by digitising waste trade, creating formal jobs in recycling and logistics, and generating environmental data that informs policy.

"Platforms like EcoTrade are exactly the kind of private-sector innovation Rwanda needs to achieve Vision 2050," said a Ministry of Environment spokesperson.""",
        "tags": "vision 2050,rwanda,policy,circular economy,development",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800",
    },
    {
        "title": "Driver Safety and Best Practices for Waste Collection",
        "slug": "driver-safety-waste-collection-best-practices",
        "category": "sustainability",
        "excerpt": "Safety guidelines for EcoTrade-certified waste collection drivers.",
        "content": """Safety is the top priority for EcoTrade-certified drivers. This guide covers best practices for safe, professional waste collection operations.

**Personal Protective Equipment (PPE):**
- Heavy-duty gloves (always)
- Safety boots with steel toe caps
- High-visibility vest
- Safety goggles when handling chemicals or glass
- N95 mask when handling organic/composting waste

**Vehicle Safety:**
- Pre-trip inspection every morning (tyres, lights, brakes)
- Maximum cargo weight must not exceed vehicle capacity
- Secure all loads before departure — use cargo nets/straps
- Never exceed the vehicle's stated UCO or liquid capacity

**Waste Handling:**
- UCO containers must be sealed before transport
- Glass must be in rigid containers, never loose
- Organic waste containers must be leak-proof

**At the Collection Point:**
- Arrive within the scheduled 30-minute window
- Confirm identity with hotel contact on arrival
- Document collected volumes using the EcoTrade app
- Upload proof-of-collection photo

**Incident Reporting:**
Any accident, spill, or safety incident must be reported via EcoTrade app within 2 hours. Contact your recycler company's operations manager immediately.""",
        "tags": "driver,safety,PPE,waste,collection",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800",
    },
    {
        "title": "From Waste to Wealth: How GreenPath Solutions Built a Circular Business",
        "slug": "greenpath-solutions-circular-business-story",
        "category": "case-study",
        "excerpt": "GreenPath's journey from informal paper collection to a certified recycling enterprise.",
        "content": """GreenPath Solutions began when founder Patrick Nzeyimana noticed that Kigali's hotels were paying to dispose of cardboard that he knew had value. He bought one truck, registered on EcoTrade, and never looked back.

**Year 1 (2022):**
- 1 truck, 3 employees
- Average monthly revenue: RWF 2.5M
- Primary waste: cardboard and office paper

**Year 2 (2023):**
- Expanded to 4 trucks
- Added glass and plastic recycling
- Revenue grew to RWF 8M/month
- First commercial composting contract

**Year 3 (2024):**
- Full fleet of 8 vehicles
- 22 full-time employees
- Revenue: RWF 18M/month
- Exporting processed paper pulp to Uganda and Tanzania

**Keys to Success:**
1. **Platform discipline** — responding to every bid within the hour
2. **Driver training** — zero missed collections in 12 months
3. **Transparency** — digital invoicing, weight certificates, photos for every job
4. **Reinvestment** — ploughing 40% of profit back into equipment

"EcoTrade gave us the legitimacy and the customer base we needed to grow fast. Without the platform, we'd still be one truck and three guys," says Patrick.""",
        "tags": "greenpath,recycler,case study,circular economy,success",
        "is_published": True,
        "is_featured": True,
        "cover_image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    },
    {
        "title": "How to Read Your EcoTrade Monthly Report",
        "slug": "understanding-ecotrade-monthly-report",
        "category": "sustainability",
        "excerpt": "A guide to interpreting your monthly waste and revenue report on EcoTrade.",
        "content": """Every EcoTrade account generates a monthly report. Here is how to read it and use the data to improve your operations.

**Section 1: Waste Summary**
Shows total volume listed, collected, and pending. Compare listed vs. collected to identify gaps.

**Section 2: Revenue Breakdown**
Detailed view of earnings by waste type. UCO typically commands highest per-kg prices; organic has lowest but highest volume potential.

**Section 3: Collection Performance**
- On-time rate (target: >95%)
- Missed collections (target: 0)
- Average time from listing to collection

**Section 4: Green Score Trend**
Month-over-month chart. A declining score usually means missed collections or infrequent listing updates.

**Section 5: CO₂ Savings**
Calculates estimated kg of CO₂ equivalent avoided through recycling vs. landfill disposal.

**Section 6: Recycler Ratings**
Your ratings for each recycler based on collection quality, punctuality, and professionalism.

**Using the Report:**
Download the PDF version to share with your sustainability officer, GM, or for inclusion in ESG reports. Hotels above 80 on the Green Score can use the report for REMA compliance submissions.""",
        "tags": "report,data,analytics,monthly,ecotrade,guide",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    },
    {
        "title": "What is Extended Producer Responsibility and How It Affects Hotels",
        "slug": "extended-producer-responsibility-hotels-rwanda",
        "category": "news",
        "excerpt": "Rwanda's EPR framework means hotels now share responsibility for packaging waste — here is what to do.",
        "content": """Extended Producer Responsibility (EPR) is a policy approach that makes producers responsible for the full lifecycle of their products, including end-of-life management.

**Rwanda's EPR Framework:**
Enacted in 2023, Rwanda's EPR legislation covers:
- Plastic packaging
- Electronic and electrical equipment
- Batteries and accumulators
- Paper and cardboard packaging

**What This Means for Hotels:**
Hotels that purchase products in covered categories are considered "downstream producers" and must:
1. Register with REMA's EPR portal
2. Report quarterly volumes of covered packaging received
3. Demonstrate waste diversion through an approved scheme
4. Pay an EPR fee if self-managing, or join a collective scheme

**EcoTrade as Your EPR Compliance Solution:**
EcoTrade Rwanda is a REMA-approved PRO (Producer Responsibility Organisation). By using EcoTrade for covered waste streams, hotels automatically generate the documentation needed for EPR compliance.

Your monthly EcoTrade report can be submitted directly to REMA's online portal — no additional paperwork required.""",
        "tags": "EPR,regulations,compliance,REMA,packaging",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800",
    },
    {
        "title": "Kigali's Waste Revolution: How the City Went from Dirty to Clean",
        "slug": "kigali-waste-revolution-clean-city",
        "category": "news",
        "excerpt": "The remarkable transformation of Kigali from one of Africa's most polluted cities to one of its cleanest.",
        "content": """In 2000, Kigali faced a waste crisis. Open dumping was common, the single landfill was overwhelmed, and the Nyabarongo River was heavily polluted with urban runoff.

Today, Kigali is regularly cited as one of the cleanest cities in Africa. The transformation is the result of 25 years of consistent policy, strong enforcement, and growing private-sector participation.

**Key Policy Milestones:**
- 2003: National Environment Policy launched
- 2008: Plastic bag ban — the first in Africa
- 2012: Citywide waste collection monopoly broken up; private operators licensed
- 2019: Organic waste composting made mandatory for commercial premises
- 2023: EPR framework enacted
- 2025: Digital waste tracking becomes mandatory for star-rated hotels

**The Role of Citizens:**
Rwanda's umuganda (monthly community work day) maintains streets, parks, and waterways. Citizens genuinely take pride in their environment — a cultural asset that supports all formal policy initiatives.

**What Rwanda Can Teach the World:**
Political will + community ownership + private-sector innovation = transformation. No country has shown this more clearly than Rwanda.""",
        "tags": "kigali,clean city,waste revolution,history,sustainability",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800",
    },
    {
        "title": "Tips for Reducing Food Waste in Hotel Kitchens",
        "slug": "reducing-food-waste-hotel-kitchens",
        "category": "sustainability",
        "excerpt": "Practical strategies to cut food waste and reduce costs in hotel and restaurant kitchens.",
        "content": """Food waste is one of the largest and most avoidable cost centres in hotel operations. The average hotel kitchen wastes 20–30% of all food purchased.

**1. Menu Engineering**
Design menus around consistent, multi-purpose ingredients. A tomato used in breakfast eggs can also appear in lunch salad and dinner sauce.

**2. Portion Size Optimisation**
Analyse plate waste. If guests consistently leave half of a particular dish, reduce the portion size. Savings: 10–15% on food cost.

**3. First In, First Out (FIFO)**
Label all stock with receipt date. Proper FIFO rotation reduces spoilage by up to 30%.

**4. Staff Meal Planning**
Use surplus food for well-designed staff meals rather than discarding it. This saves money, boosts morale, and reduces waste.

**5. Smart Purchasing**
Order based on confirmed bookings, not estimates. Work with suppliers who offer flexible last-minute orders.

**6. Composting What Remains**
Even with the best practices, some food waste is unavoidable. List it on EcoTrade — composters will collect it and pay you for it.

**Target:** Hotels implementing all six strategies typically reduce food waste by 40–50%, saving RWF 2–5M annually for a 100-room property.""",
        "tags": "food waste,kitchen,hotel,tips,sustainability",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    },
    {
        "title": "Building a Sustainable Meetings and Events Programme",
        "slug": "sustainable-meetings-events-hotel",
        "category": "sustainability",
        "excerpt": "How hotels can attract eco-conscious event clients with certified sustainable events packages.",
        "content": """Corporate sustainability is now a procurement requirement for many multinational companies. Hotels that can offer certified sustainable events programmes are capturing a growing market.

**The Market Opportunity:**
MICE (Meetings, Incentives, Conferences, Exhibitions) revenue in Rwanda grew by 22% in 2024. Sustainability-certified venues command a 15–25% price premium.

**Core Elements of a Sustainable Events Package:**
1. Zero single-use plastic commitment
2. All food waste composted via EcoTrade-certified partner
3. Digital communications in place of printed materials
4. Carbon offset available for delegates who request it
5. Local sourcing for all catering (80%+ of food spend within 100 km)
6. Event waste diversion certificate (EcoTrade-generated, presented to client)

**Certification Options:**
- EcoTrade Green Events Standard (available April 2025)
- Rwanda Tourism Board Sustainable MICE Certification
- GSTC-Recognised Accreditation (for international clients)

**Case Study:**
The Kigali Radiant Hotel introduced a Sustainable Events Package in Q3 2024. Within six months, 40% of their conference bookings selected the premium package, generating an additional RWF 8M in annual revenue.""",
        "tags": "events,MICE,sustainable,hotel,corporate",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    },
    {
        "title": "The Future of Waste Processing: Biogas and Biofuels in Rwanda",
        "slug": "biogas-biofuels-future-rwanda-waste",
        "category": "recycling",
        "excerpt": "Rwanda's growing biogas sector is creating new markets for organic waste from hotels.",
        "content": """Biogas — methane produced by anaerobic digestion of organic matter — is emerging as a major opportunity for Rwanda's waste management sector.

**How Biogas Works:**
Organic waste (kitchen scraps, grass cuttings, used cooking oil) is fed into an anaerobic digester. Bacteria break it down, producing:
- Biogas (60–70% methane) — used for cooking, electricity, or vehicle fuel
- Digestate — a nutrient-rich liquid fertiliser

**Current Biogas Projects in Rwanda:**
- Kigali Bulk Water Treatment Plant: uses digestate from organic waste
- Several university campuses: on-site digesters fuelled by canteen waste
- Nyungwe National Park Buffer Zone Community Biogas Scheme

**Opportunity for Hotels:**
Hotels generating 500+ kg/week of organic waste are ideal feedstock suppliers for commercial biogas plants. Expected prices:
- Organic kitchen waste: RWF 50–100/kg (delivered)
- UCO: RWF 500–700/litre (for biodiesel production)

**Future Outlook:**
Rwanda's energy regulator is developing a feed-in tariff for biogas electricity, expected to launch in 2026. This will significantly increase the value of organic waste contracts for hotel suppliers.""",
        "tags": "biogas,biofuel,organic waste,energy,future",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800",
    },
    {
        "title": "Introducing EcoTrade's New Certification Programme",
        "slug": "ecotrade-certification-programme-launch",
        "category": "news",
        "excerpt": "Hotels and recyclers can now apply for EcoTrade's official certification badges.",
        "content": """EcoTrade Rwanda is proud to announce the launch of its official Certification Programme, available from April 2025.

**Three Certification Levels:**

🥉 **EcoTrade Certified (Bronze)**
- Green Score: 60–79
- Minimum 6 months on platform
- At least 20 completed collections

🥈 **EcoTrade Certified (Silver)**
- Green Score: 80–89
- Minimum 12 months on platform
- Zero missed collections in past 3 months

🥇 **EcoTrade Certified (Gold)**
- Green Score: 90–99
- Minimum 18 months on platform
- Independent environmental audit

🏆 **EcoTrade Certified (Platinum)**
- Green Score: 100
- Minimum 24 months on platform
- Published environmental impact report

**Benefits of Certification:**
- Physical certificate suitable for framing or lobby display
- Digital badge for websites, menus, and social media
- Listing in EcoTrade's Certified Hotels directory (distributed to travel agencies and corporate bookers)
- Access to premium certification pricing from EcoTrade-certified recyclers

Apply via your EcoTrade dashboard from 1 April 2025.""",
        "tags": "certification,programme,news,2025,launch",
        "is_published": True,
        "is_featured": True,
        "cover_image": "https://images.unsplash.com/photo-1495527400402-35b9b4b6025d?w=800",
    },
    {
        "title": "Plastic-Free Kigali 2030: What Hotels Need to Do Now",
        "slug": "plastic-free-kigali-2030-hotel-action-plan",
        "category": "news",
        "excerpt": "Kigali's ambitious plastic-free goal means hotels must accelerate their transition today.",
        "content": """The City of Kigali has set a bold target: plastic-free operations by 2030. For hotels, this means accelerating the transition away from single-use plastics across all touchpoints.

**High-Priority Changes (2025–2026):**
- In-room amenities: switch to bar soap, shampoo bars, and bamboo toothbrushes
- F&B: paper or bamboo straws only; no plastic cutlery at any events
- Welcome packs: fabric tote bags instead of plastic — guests love taking them home
- Housekeeping: solid detergent tablets instead of plastic bottles

**Medium Priority (2026–2028):**
- Eliminate all plastic water bottles from in-room minibar
- Switch to glass or aluminium for all bar beverages
- Replace plastic garment bags with cotton or paper alternatives

**Long-term (2028–2030):**
- 100% of food purchases in reusable or compostable packaging
- Eliminate laundry plastic covers
- Plastic-free kitchen (replace all plastic prep containers with stainless or glass)

**Cost of Transition vs. Cost of Non-Compliance:**
The upfront investment across all categories averages RWF 3–5M for a 100-room hotel. Fines for non-compliance after 2028 can reach RWF 10M per annum. The maths is simple: act now.""",
        "tags": "plastic free,kigali,2030,hotel,regulations",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
    },
    {
        "title": "Interview: The CEO of EcoRevive Rwanda on the Future of Recycling",
        "slug": "interview-ecorevive-ceo-future-recycling",
        "category": "case-study",
        "excerpt": "An exclusive conversation about the challenges and opportunities facing Rwanda's recycling industry.",
        "content": """We sat down with Jean-Claude Habimana, CEO of EcoRevive Rwanda, to discuss the future of the industry.

**EcoTrade: How did EcoRevive begin?**

*Jean-Claude:* I used to work for a Nairobi-based recycler that exported materials to China. When I came back to Rwanda I saw that nobody was doing this properly. Hotels had waste, recyclers had capacity, but there was no trustworthy intermediary. I started EcoRevive with a single truck and my savings from Nairobi.

**EcoTrade: What has been your biggest challenge?**

*Jean-Claude:* Trust. Both hotels and recyclers have been burnt before — hotels by recyclers who don't show up, recyclers by hotels who don't segregate properly. The digital contract and real-time tracking on EcoTrade solved this. Now there is accountability on both sides.

**EcoTrade: What comes next for EcoRevive?**

*Jean-Claude:* We are planning a biogas collection service targeting hotels along the Kigali–Musanze highway. The feedstock contracts are nearly signed. We also want to expand into e-waste — there's enormous untapped value there.

**EcoTrade: Advice for young Rwandan entrepreneurs?**

*Jean-Claude:* Start with one thing, do it perfectly, then expand. We did paper and cardboard only for the first year. Once we had perfect reliability scores, hotels trusted us with UCO, then glass, then organics. Narrow focus first, then grow.""",
        "tags": "interview,CEO,EcoRevive,recycling,entrepreneurship",
        "is_published": True,
        "is_featured": False,
        "cover_image": "https://images.unsplash.com/photo-1560472355-536de3962603?w=800",
    },
]


def seed_blogs(db: Session, admin_user: User) -> int:
    added = 0
    for data in BLOG_POSTS:
        if db.query(BlogPost).filter(BlogPost.slug == data["slug"]).first():
            continue  # Skip existing
        offset_days = random.randint(0, 180)
        created = now - timedelta(days=offset_days)
        post = BlogPost(
            title=data["title"],
            slug=data["slug"],
            category=data["category"],
            excerpt=data["excerpt"],
            content=data["content"],
            tags=data.get("tags", ""),
            featured_image=data.get("cover_image", ""),
            is_published=data.get("is_published", True),
            is_featured=data.get("is_featured", False),
            published_at=created if data.get("is_published", True) else None,
            author_id=admin_user.id,
            view_count=random.randint(20, 800),
            created_at=created,
            updated_at=created,
        )
        db.add(post)
        added += 1
    db.commit()
    return added


# ─── More Collections ─────────────────────────────────────────────────────────

WASTE_TYPES_KG = {
    "food_waste": "kg",
    "cardboard": "kg",
    "glass": "kg",
    "metal": "kg",
    "paper": "kg",
    "organic": "kg",
}


def seed_extra_collections(db: Session) -> int:
    hotels = db.query(Hotel).all()
    recyclers = db.query(Recycler).all()
    drivers = db.query(Driver).all()
    listings = db.query(WasteListing).filter(WasteListing.status == ListingStatus.open).all()

    if not hotels or not recyclers or not listings:
        print("  ⚠️  Not enough base data for extra collections — skipping.")
        return 0

    statuses = [CollectionStatus.completed, CollectionStatus.completed,
                CollectionStatus.completed, CollectionStatus.scheduled,
                CollectionStatus.en_route]

    added = 0
    for i in range(min(30, len(listings) * 2)):
        listing = random.choice(listings)
        recycler = random.choice(recyclers)
        driver = random.choice(drivers) if drivers else None
        status = random.choice(statuses)

        days_ago = random.randint(1, 90)
        sched = now - timedelta(days=days_ago)

        # Avoid duplicate collection per listing (simple check)
        existing = db.query(Collection).filter(
            Collection.listing_id == listing.id,
            Collection.recycler_id == recycler.id,
        ).first()
        if existing:
            continue

        completed_at_val = sched + timedelta(hours=random.randint(2, 48)) if status == CollectionStatus.completed else None
        col = Collection(
            listing_id=listing.id,
            hotel_id=listing.hotel_id,
            recycler_id=recycler.id,
            driver_id=driver.id if driver else None,
            vehicle_id=driver.vehicle_id if driver else None,
            status=status,
            scheduled_date=sched,
            scheduled_time="09:00",
            actual_volume=round(random.uniform(50, 500), 1),
            notes="Auto-seeded collection",
            completed_at=completed_at_val,
            created_at=sched,
            updated_at=sched + timedelta(days=random.randint(0, 3)),
        )
        db.add(col)
        added += 1

    db.commit()
    return added


# ─── Extra Transactions ───────────────────────────────────────────────────────

def seed_extra_transactions(db: Session) -> int:
    hotels = db.query(Hotel).all()
    recyclers = db.query(Recycler).all()
    if not hotels or not recyclers:
        return 0

    admin = db.query(User).filter(User.role == UserRole.admin).first()
    if not admin:
        return 0

    added = 0
    descriptions = [
        "UCO collection — monthly", "Glass waste — bulk pickup",
        "Cardboard recycling Q1", "Organic compost agreement",
        "Metal scrap — kitchen renovation", "Paper export batch",
        "Biodiesel feedstock delivery", "Food waste weekly",
    ]

    for _ in range(40):
        hotel = random.choice(hotels)
        recycler = random.choice(recyclers)
        gross = random.randint(50_000, 2_000_000)
        fee = int(gross * 0.05)
        net = gross - fee
        days_ago = random.randint(1, 365)
        tx_date = now - timedelta(days=days_ago)
        ref = f"TXN-SEED-{uuid.uuid4().hex[:12].upper()}"

        tx = Transaction(
            hotel_id=hotel.id,
            recycler_id=recycler.id,
            gross_amount=gross,
            platform_fee=fee,
            net_amount=net,
            reference=ref,
            status=TransactionStatus.completed,
            description=random.choice(descriptions),
            completed_at=tx_date,
            created_at=tx_date,
            updated_at=tx_date,
        )
        db.add(tx)
        added += 1

    db.commit()
    return added


# ─── Enrich Drivers with names / availability ─────────────────────────────────

def enrich_drivers(db: Session) -> int:
    drivers = db.query(Driver).all()
    vehicles = db.query(Vehicle).all()

    statuses = [DriverStatus.available, DriverStatus.available,
                DriverStatus.on_route, DriverStatus.off_duty]
    vehicle_types = ["Pickup Truck", "Box Truck", "Refrigerated Van", "Mini Truck", "Flatbed"]
    
    enriched = 0
    for driver in drivers:
        changed = False
        if driver.status is None:
            driver.status = random.choice(statuses)
            changed = True
        if not driver.phone:
            driver.phone = f"+25078{random.randint(1000000, 9999999)}"
            changed = True
        if driver.rating == 0:
            driver.rating = round(random.uniform(3.5, 5.0), 1)
            changed = True
        if driver.total_trips < 5:
            driver.total_trips = random.randint(10, 250)
            changed = True
        if changed:
            enriched += 1

    # Enrich vehicles
    for veh in vehicles:
        if not veh.vehicle_type or veh.vehicle_type == "truck":
            veh.vehicle_type = random.choice(vehicle_types)

    db.commit()
    return enriched


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    db: Session = SessionLocal()
    try:
        print("\n🌱 EcoTrade Rwanda — Comprehensive Data Seed")
        print("=" * 60)

        admin_user = db.query(User).filter(User.role == UserRole.admin).first()
        if not admin_user:
            print("❌  No admin user found. Run seed.py first.")
            return

        # Blogs
        n_blogs = seed_blogs(db, admin_user)
        total_blogs = db.query(BlogPost).count()
        print(f"📝  Added {n_blogs} blog posts  (total: {total_blogs})")

        # Collections
        try:
            n_col = seed_extra_collections(db)
            print(f"🚛  Added {n_col} extra collections")
        except Exception as e:
            db.rollback()
            print(f"⚠️   Collections seed failed: {e}")

        # Transactions
        try:
            n_tx = seed_extra_transactions(db)
            print(f"💰  Added {n_tx} extra transactions")
        except Exception as e:
            db.rollback()
            print(f"⚠️   Transactions seed failed: {e}")

        # Drivers
        try:
            n_drivers = enrich_drivers(db)
            print(f"🚘  Enriched {n_drivers} driver profiles")
        except Exception as e:
            db.rollback()
            print(f"⚠️   Driver enrichment failed: {e}")

        print("\n✅  Seeding complete!")
        print("=" * 60)
        
        # Final counts
        print(f"\n📊 Database summary:")
        print(f"   Blog posts : {db.query(BlogPost).count()}")
        print(f"   Collections: {db.query(Collection).count()}")
        print(f"   Drivers    : {db.query(Driver).count()}")
        print(f"   Vehicles   : {db.query(Vehicle).count()}")

    except Exception as e:
        db.rollback()
        print(f"💥  Fatal error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
