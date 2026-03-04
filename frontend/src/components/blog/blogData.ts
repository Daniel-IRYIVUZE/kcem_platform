export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Rise of UCO Recycling in East Africa',
    excerpt: 'Used Cooking Oil is becoming a valuable commodity for biodiesel production. Learn how hotels are cashing in.',
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=600',
    author: 'Marie Claire Uwase',
    authorAvatar: '/images/default-avatar.svg',
    date: 'Jan 12, 2026',
    readTime: '5 min',
    category: 'Circular Economy',
    tags: ['UCO', 'Biodiesel', 'Revenue'],
    likes: 234,
    comments: 18,
    views: 12500,
    content: [
      'Used Cooking Oil is emerging as a high-value input for biodiesel production across East Africa.',
      'Hotels and restaurants in Kigali are discovering new revenue streams by partnering with certified recyclers.',
      'EcoTrade simplifies collection logistics and provides transparent pricing to keep the market moving.'
    ]
  },
  {
    id: 2,
    title: 'Glass Recycling: Challenges and Opportunities in Kigali',
    excerpt: 'Why glass recycling has been difficult and how EcoTrade is solving the logistics puzzle.',
    image: 'https://images.unsplash.com/photo-1611289016315-450b1a3c7b7f?w=600',
    author: 'Jean Paul Habimana',
    authorAvatar: '/images/default-avatar.svg',
    date: 'Jan 10, 2026',
    readTime: '7 min',
    category: 'Technology',
    tags: ['Glass', 'Logistics', 'Recycling'],
    likes: 156,
    comments: 12,
    views: 8900,
    content: [
      'Glass is heavy, fragile, and expensive to transport, which makes recycling difficult.',
      'EcoTrade uses optimized routing and batch pickups to reduce transport costs.',
      'New partnerships with processing facilities are helping Kigali close the glass loop.'
    ]
  },
  {
    id: 3,
    title: 'How Serena Hotel Achieved 85% Waste Diversion',
    excerpt: "A deep dive into Serena Hotel's journey to becoming one of Kigali's most sustainable hotels.",
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600',
    author: 'Daniel IRYIVUZE',
    authorAvatar: '/images/default-avatar.svg',
    date: 'Jan 8, 2026',
    readTime: '10 min',
    category: 'Success Stories',
    tags: ['Hotel', 'Case Study', 'Green Score'],
    likes: 445,
    comments: 32,
    views: 7600,
    content: [
      'Serena Hotel built a cross-department waste separation program aligned to the EcoTrade marketplace.',
      'The team implemented staff training, reporting dashboards, and monthly audits.',
      'Within six months, diversion rates reached 85 percent and operational costs decreased.'
    ]
  },
  {
    id: 4,
    title: "Rwanda's New EPR Regulations: What Businesses Need to Know",
    excerpt: 'Understanding the Extended Producer Responsibility framework and its impact on HORECA businesses.',
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600',
    author: "Dr. Jeanne d'Arc Uwera",
    authorAvatar: '/images/default-avatar.svg',
    date: 'Jan 5, 2026',
    readTime: '6 min',
    category: 'Policy & Regulation',
    tags: ['EPR', 'REMA', 'Compliance'],
    likes: 189,
    comments: 24,
    views: 5400,
    content: [
      'EPR regulations are reshaping how producers and businesses manage waste in Rwanda.',
      'HORECA businesses are expected to track material flows and report recovery rates.',
      'EcoTrade makes compliance easier with verified transactions and audit-ready reports.'
    ]
  },
  {
    id: 5,
    title: 'PostGIS vs. Traditional Routing: A Technical Deep Dive',
    excerpt: 'How geospatial clustering is revolutionizing waste collection efficiency.',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600',
    author: 'Neza David Tuyishimire',
    authorAvatar: '/images/default-avatar.svg',
    date: 'Jan 3, 2026',
    readTime: '12 min',
    category: 'Technology',
    tags: ['PostGIS', 'Algorithms', 'Optimization'],
    likes: 267,
    comments: 15,
    views: 4300,
    content: [
      'Geospatial clustering makes it possible to group pickups by proximity and material type.',
      'EcoTrade uses PostGIS to build routes that minimize fuel and time while maximizing payload.',
      'The result is a 40 percent reduction in travel distance for partner drivers.'
    ]
  },
  {
    id: 6,
    title: "Interview: Meet the Drivers Behind Kigali's Recycling Revolution",
    excerpt: 'Stories from the frontline - drivers share their experiences with EcoTrade.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600',
    author: 'Ineza Mukamurenzi',
    authorAvatar: '/images/default-avatar.svg',
    date: 'Dec 28, 2025',
    readTime: '8 min',
    category: 'Interviews',
    tags: ['Drivers', 'Community', 'Impact'],
    likes: 312,
    comments: 27,
    views: 5200,
    content: [
      'Drivers are the backbone of Kigali\'s recycling network.',
      'This interview covers route planning, safety, and community impact stories.',
      'EcoTrade\'s driver app keeps pickups efficient and transparent.'
    ]
  },
  {
    id: 7,
    title: "10 Tips to Improve Your Hotel's Green Score",
    excerpt: 'Practical advice for HORECA businesses to boost their sustainability metrics.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
    author: 'Marie Claire Uwase',
    authorAvatar: '/images/default-avatar.svg',
    date: 'Dec 25, 2025',
    readTime: '6 min',
    category: 'Tips & Guides',
    tags: ['Green Score', 'Tips', 'Sustainability'],
    likes: 423,
    comments: 31,
    views: 6900,
    content: [
      'Start with a clear baseline by auditing waste streams by material type.',
      'Align your procurement and disposal vendors with circular economy targets.',
      'EcoTrade provides Green Score insights to help track improvement over time.'
    ]
  },
  {
    id: 8,
    title: 'The Economics of Waste: Why Landfills are Costing You Money',
    excerpt: 'Analysis of the true cost of linear waste management vs. circular economy benefits.',
    image: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?w=600',
    author: 'Fidele Nkurunziza',
    authorAvatar: '/images/default-avatar.svg',
    date: 'Dec 22, 2025',
    readTime: '9 min',
    category: 'Research',
    tags: ['Economics', 'Cost Analysis', 'ROI'],
    likes: 198,
    comments: 14,
    views: 4100,
    content: [
      'Landfill disposal hides the true cost of waste through lost material value.',
      'Circular economy models reduce fees while creating new revenue streams.',
      'Businesses that track data-driven diversion outperform peers financially.'
    ]
  }
];

export const featuredPostId = 1;

export const getPostById = (id: number) => blogPosts.find((post) => post.id === id);
