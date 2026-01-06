export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  link?: string;
}

export interface Review {
  id: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  serviceName: string;
  date: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  tagline: string;
  description: string;
  location: string;
  memberSince: string;
  responseTime: string;
  completionRate: number;
  totalProjects: number;
  rating: number;
  reviewCount: number;
  skills: string[];
  portfolio: PortfolioItem[];
  reviews: Review[];
}

export const vendors: Vendor[] = [
  {
    id: '2',
    name: 'Digital Agency',
    email: 'vendor@example.com',
    tagline: 'Full-service digital marketing agency',
    description: 'We are a passionate team of digital marketing experts dedicated to helping businesses grow online. With over 10 years of experience, we specialize in SEO, content marketing, and social media management.',
    location: 'New York, USA',
    memberSince: 'January 2023',
    responseTime: '< 2 hours',
    completionRate: 98,
    totalProjects: 156,
    rating: 4.9,
    reviewCount: 127,
    skills: ['SEO', 'Content Marketing', 'Social Media', 'PPC', 'Email Marketing', 'Analytics'],
    portfolio: [
      {
        id: 'p1',
        title: 'E-commerce SEO Overhaul',
        description: 'Increased organic traffic by 340% for a major e-commerce brand',
        image: '/placeholder.svg',
        category: 'SEO'
      },
      {
        id: 'p2',
        title: 'Social Media Campaign',
        description: 'Viral campaign that reached 2M+ users',
        image: '/placeholder.svg',
        category: 'Social Media'
      },
      {
        id: 'p3',
        title: 'Brand Awareness Campaign',
        description: 'Full brand refresh and digital launch strategy',
        image: '/placeholder.svg',
        category: 'Branding'
      },
      {
        id: 'p4',
        title: 'Lead Generation Funnel',
        description: 'Generated 5,000+ qualified leads in 3 months',
        image: '/placeholder.svg',
        category: 'PPC'
      }
    ],
    reviews: [
      {
        id: 'r1',
        clientName: 'Sarah Johnson',
        rating: 5,
        comment: 'Absolutely fantastic work! They exceeded all expectations and delivered results ahead of schedule. Our organic traffic has tripled.',
        serviceName: 'Complete SEO Audit & Strategy',
        date: '2024-01-15'
      },
      {
        id: 'r2',
        clientName: 'Mike Chen',
        rating: 5,
        comment: 'Professional team that really understands digital marketing. Communication was excellent throughout the project.',
        serviceName: 'Social Media Management',
        date: '2024-01-10'
      },
      {
        id: 'r3',
        clientName: 'Emily Davis',
        rating: 4,
        comment: 'Great results on our PPC campaign. ROI increased by 200%. Would recommend to anyone looking for paid ads expertise.',
        serviceName: 'Google Ads Campaign Setup',
        date: '2024-01-05'
      },
      {
        id: 'r4',
        clientName: 'James Wilson',
        rating: 5,
        comment: 'The content they created was exceptional. Well-researched, engaging, and perfectly aligned with our brand voice.',
        serviceName: 'Content Writing Package',
        date: '2023-12-28'
      }
    ]
  }
];

export const getVendorById = (id: string) => {
  return vendors.find(vendor => vendor.id === id);
};

export const getVendorByEmail = (email: string) => {
  return vendors.find(vendor => vendor.email === email);
};
