"""
Seed blog posts into existing database
"""
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.blog import BlogPost
from app.models.user import User


def seed_blogs():
    db: Session = SessionLocal()
    
    try:
        # Get admin user as author
        admin_user = db.query(User).filter(User.email == "admin@ecotrade.rw").first()
        
        if not admin_user:
            print("❌ Admin user not found. Please run main seeder first.")
            return
        
        # Check if blog posts already exist — delete all and re-seed to pick up author names
        existing_count = db.query(BlogPost).count()
        if existing_count > 0:
            db.query(BlogPost).delete()
            db.commit()
            print(f"  ♻ Cleared {existing_count} existing blog posts — re-seeding with author names…")
        
        print("🌱 Seeding Blog Posts...")
        print("=" * 80)
        
        blog_posts_data = [
            {
                "title": "Rwanda's Journey to Becoming Africa's Green Leader",
                "slug": "rwanda-green-leader-africa",
                "category": "sustainability",
                "author_display_name": "Dr. Amara Nkusi",
                "excerpt": "How Rwanda is transforming waste management and leading the continent in environmental conservation.",
                "content": """Rwanda has emerged as a beacon of environmental sustainability in Africa. Through innovative policies and strong government commitment, the nation has achieved remarkable progress in waste management and recycling.

The ban on plastic bags in 2008 was just the beginning. Today, Rwanda boasts one of the cleanest cities in Africa, with Kigali setting standards for urban environmental management. The EcoTrade platform is part of this vision, connecting hotels, recyclers, and drivers to create a circular economy.

Key achievements include:
- 90% waste collection coverage in urban areas
- Growing recycling industry creating thousands of jobs
- Integration of informal waste pickers into formal economy
- Public-private partnerships driving innovation

This transformation wouldn't be possible without the dedication of our partners and the Rwandan people's commitment to a cleaner, greener future.""",
                "tags": "rwanda,sustainability,green economy,waste management,africa",
                "is_published": True,
                "is_featured": True,
            },
            {
                "title": "The Economic Value of Used Cooking Oil Recycling",
                "slug": "uco-value-recycling-biodiesel",
                "category": "recycling",
                "author_display_name": "Ingrid Uwimana",
                "excerpt": "Discover how hotels can turn used cooking oil into a valuable commodity while protecting the environment.",
                "content": """Used Cooking Oil (UCO) is more than just waste—it's a valuable resource that can be converted into biodiesel, animal feed, and industrial products.

For hotels and restaurants in Rwanda, proper UCO management offers multiple benefits:

**Economic Benefits:**
- Generate revenue from waste that was previously a disposal cost
- Typical prices range from 400-800 RWF per liter
- Large hotels can collect 200-500 liters monthly
- Annual revenue potential of 1-4 million RWF

**Environmental Benefits:**
- Prevent FOG (Fats, Oils, Grease) blockages in sewers
- Reduce water pollution
- Lower carbon emissions through biodiesel production
- Each liter of UCO recycled saves 2.5kg of CO₂ emissions

**Best Practices:**
- Use dedicated collection containers
- Filter out food particles before storage
- Store in cool, dry locations
- Schedule regular pickups through EcoTrade

Join the growing number of hotels partnering with certified recyclers through our platform.""",
                "tags": "uco,recycling,biodiesel,hotels,revenue",
                "is_published": True,
                "is_featured": True,
            },
            {
                "title": "Success Story: Kigali Serena Hotel's Waste Reduction Journey",
                "slug": "serena-hotel-waste-success",
                "category": "case-study",
                "author_display_name": "Jean-Pierre Habimana",
                "excerpt": "How one of Kigali's premier hotels achieved 70% waste diversion through strategic partnerships.",
                "content": """When Kigali Serena Hotel joined EcoTrade Rwanda six months ago, they were disposing of over 2 tons of waste monthly. Today, they've achieved a 70% diversion rate, generating revenue while significantly reducing their environmental impact.

**The Challenge:**
Like many luxury hotels, Serena faced rising waste disposal costs and growing pressure to demonstrate environmental responsibility to eco-conscious guests.

**The Solution:**
Through EcoTrade's platform, Serena connected with multiple certified recyclers:
- GreenCycle Rwanda for UCO collection
- EcoLink Africa for glass recycling
- WasteMasters for cardboard and paper

**The Results:**
- 1,200 liters of UCO collected monthly
- 800kg of glass recycled
- 500kg of cardboard diverted from landfills
- Monthly revenue of 980,000 RWF
- Green Score increased to 92/100
- Featured in international sustainability reports

**Guest Impact:**
Guest feedback has been overwhelmingly positive, with many citing the hotel's environmental initiatives as a factor in their booking decision.

"Joining EcoTrade was one of the best operational decisions we've made," says the Hotel Manager. "We're not just saving money—we're contributing to Rwanda's green vision while attracting environmentally conscious guests."

Ready to start your sustainability journey? Contact us today.""",
                "tags": "case study,hotels,success story,waste reduction,kigali",
                "is_published": True,
                "is_featured": True,
            },
            {
                "title": "Understanding Rwanda's Waste Hierarchy",
                "slug": "rwanda-waste-hierarchy-guide",
                "category": "sustainability",
                "author_display_name": "Dr. Amara Nkusi",
                "excerpt": "A comprehensive guide to Rwanda's approach to waste management and the role of each stakeholder.",
                "content": """Rwanda follows the internationally recognized waste hierarchy, prioritizing prevention, reuse, recycling, recovery, and finally disposal.

**1. Prevention:**
The most effective form of waste management. Hotels can reduce waste by:
- Choosing products with minimal packaging
- Implementing portion control
- Training staff on waste-conscious practices

**2. Reuse:**
Extending product life before it becomes waste:
- Returnable packaging systems
- Donation programs for usable items
- Creative repurposing initiatives

**3. Recycling:**
Converting waste into new materials:
- Glass, plastic, paper, metal separation
- UCO collection for biodiesel
- Organic waste for composting

**4. Recovery:**
Energy generation from non-recyclable waste:
- Waste-to-energy facilities (planned)
- Biogas from organic waste

**5. Disposal:**
Only as a last resort:
- Sanitary landfills for non-recyclable, non-recoverable waste
- Strict regulations on hazardous waste

**EcoTrade's Role:**
Our platform facilitates steps 2-4, connecting waste generators with recyclers and ensuring materials stay in the circular economy as long as possible.

Every stakeholder has a role to play in moving up the waste hierarchy.""",
                "tags": "waste hierarchy,rwanda,recycling,sustainability,education",
                "is_published": True,
                "is_featured": False,
            },
            {
                "title": "Meet Our Recycler Partners: GreenCycle Rwanda",
                "slug": "greencycle-rwanda-profile",
                "category": "news",
                "author_display_name": "EcoTrade Editorial Team",
                "excerpt": "Learn about one of Rwanda's leading recycling companies and their innovative approaches to waste management.",
                "content": """GreenCycle Rwanda has been at the forefront of Rwanda's recycling revolution since 2018. With a focus on UCO, plastics, and glass, they've diverted over 500 tons of waste from landfills.

**About GreenCycle:**
Founded by environmental engineer Jean-Pierre Habimana, GreenCycle operates from a modern facility in Kigali's industrial zone. They employ 45 people and operate a fleet of 8 collection vehicles.

**Services:**
- UCO collection and biodiesel production
- Plastic waste processing and pelletization
- Glass crushing and aggregate production
- Environmental consultation for businesses

**Innovation:**
GreenCycle recently launched Rwanda's first mobile recycling app, allowing individuals to schedule pickups and track their environmental impact.

**Community Impact:**
- Partnered with 50+ hotels and restaurants
- Trained 20 youth in recycling techniques
- Sponsored environmental education in schools
- Operates a small business incubator for green startups

**Future Plans:**
"We're expanding our capacity to handle electronic waste and plan to open a second facility in Huye by 2027," says Habimana. "EcoTrade has been instrumental in connecting us with quality suppliers and streamlining our operations."

Looking for a reliable recycling partner? Contact GreenCycle through our platform.""",
                "tags": "recyclers,greencycle,profile,innovation,rwanda",
                "is_published": True,
                "is_featured": False,
            },
            {
                "title": "How to Get Started with EcoTrade Rwanda",
                "slug": "getting-started-ecotrade-guide",
                "category": "news",
                "author_display_name": "EcoTrade Support Team",
                "excerpt": "A step-by-step guide for hotels and recyclers joining Rwanda's leading waste trading platform.",
                "content": """Getting started with EcoTrade Rwanda is simple. Here's how to begin your journey toward sustainability and revenue generation.

**For Hotels and Restaurants:**

Step 1: Create Your Account
- Visit ecotrade.rw and click "Sign Up"
- Choose "Hotel/Restaurant" as your account type
- Provide business details and verification documents

Step 2: Complete Your Profile
- Add your location and business hours
- Specify waste types and typical volumes
- Upload required licenses and certifications

Step 3: Create Your First Listing
- Select waste type (UCO, glass, plastic, etc.)
- Specify quantity and collection frequency
- Set minimum acceptable bid
- Add photos and special instructions

Step 4: Receive and Review Bids
- Certified recyclers will bid on your listing
- Review company profiles and ratings
- Compare offers and terms
- Accept the best bid for your needs

Step 5: Schedule Collection
- Coordinate with the recycler's driver
- Prepare waste according to guidelines
- Collection is completed and verified
- Payment processed within 48 hours

**For Recyclers:**

Step 1: Registration
- Apply for a recycler account
- Submit business registration documents
- Provide processing capacity details
- Pass verification process (24-48 hours)

Step 2: Browse Listings
- Filter by waste type and location
- View detailed listing information
- Check collection schedules

Step 3: Place Your Bids
- Offer competitive prices
- Specify collection terms
- Add notes about your service

Step 4: Win and Collect
- Coordinate with hotels
- Dispatch drivers with proper equipment
- Complete collection with photo verification
- Build your reputation with ratings

**Support:**
Our team is available Monday-Saturday, 8 AM-6 PM
Email: support@ecotrade.rw
Phone: +250 788 000 000

Join hundreds of businesses already trading waste sustainably!""",
                "tags": "getting started,tutorial,guide,hotels,recyclers",
                "is_published": True,
                "is_featured": False,
            },
        ]
        
        blog_count = 0
        for post_data in blog_posts_data:
            post = BlogPost(
                author_id=admin_user.id,
                published_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)),
                view_count=random.randint(50, 500),
                **post_data
            )
            db.add(post)
            blog_count += 1
        
        db.commit()
        print(f"  ✓ Created {blog_count} blog posts")
        print("=" * 80)
        print("✅ Blog seeding complete!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding blogs: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_blogs()
