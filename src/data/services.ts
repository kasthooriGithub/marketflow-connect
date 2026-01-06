export interface Service {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  price: number;
  priceType: 'one-time' | 'monthly' | 'hourly';
  vendorId: string;
  vendorName: string;
  vendorAvatar?: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  features: string[];
  tags: string[];
  image: string;
  popular?: boolean;
}

export const categories = [
  { id: 'seo', name: 'SEO Services', icon: '🔍', count: 24 },
  { id: 'social-media', name: 'Social Media', icon: '📱', count: 32 },
  { id: 'content', name: 'Content Marketing', icon: '✍️', count: 18 },
  { id: 'ppc', name: 'PPC & Ads', icon: '📈', count: 15 },
  { id: 'email', name: 'Email Marketing', icon: '📧', count: 12 },
  { id: 'analytics', name: 'Analytics', icon: '📊', count: 9 },
  { id: 'video', name: 'Video Marketing', icon: '🎬', count: 21 },
  { id: 'branding', name: 'Branding', icon: '🎨', count: 16 },
];

export const services: Service[] = [
  {
    id: '1',
    title: 'Complete SEO Audit & Strategy',
    description: 'Comprehensive SEO audit with actionable recommendations to boost your search rankings.',
    longDescription: 'Get a complete analysis of your website\'s SEO health including technical SEO, on-page optimization, backlink profile, and competitor analysis. Receive a detailed report with prioritized action items and a 90-day implementation roadmap.',
    category: 'seo',
    price: 499,
    priceType: 'one-time',
    vendorId: '2',
    vendorName: 'SearchPro Digital',
    rating: 4.9,
    reviewCount: 127,
    deliveryTime: '5-7 days',
    features: [
      'Technical SEO Analysis',
      'Keyword Research (50+ keywords)',
      'Competitor Analysis (5 competitors)',
      'Backlink Profile Review',
      '90-Day Action Plan',
      'Monthly Follow-up Call'
    ],
    tags: ['SEO', 'Audit', 'Strategy'],
    image: '/placeholder.svg',
    popular: true
  },
  {
    id: '2',
    title: 'Social Media Management',
    description: 'Full-service social media management across all major platforms.',
    longDescription: 'Let our team handle your social media presence. We create engaging content, manage your community, and grow your following across Instagram, Facebook, Twitter, and LinkedIn.',
    category: 'social-media',
    price: 899,
    priceType: 'monthly',
    vendorId: '3',
    vendorName: 'Social Buzz Agency',
    rating: 4.8,
    reviewCount: 89,
    deliveryTime: 'Ongoing',
    features: [
      '20 Posts per Month',
      'Story Creation',
      'Community Management',
      'Monthly Analytics Report',
      'Content Calendar',
      'Hashtag Strategy'
    ],
    tags: ['Social Media', 'Management', 'Content'],
    image: '/placeholder.svg',
    popular: true
  },
  {
    id: '3',
    title: 'Google Ads Campaign Setup',
    description: 'Professional Google Ads campaign setup and optimization for maximum ROI.',
    longDescription: 'Launch high-converting Google Ads campaigns with our expert setup service. Includes keyword research, ad copywriting, landing page recommendations, and conversion tracking setup.',
    category: 'ppc',
    price: 799,
    priceType: 'one-time',
    vendorId: '4',
    vendorName: 'PPC Masters',
    rating: 4.7,
    reviewCount: 64,
    deliveryTime: '3-5 days',
    features: [
      'Campaign Structure Setup',
      'Keyword Research',
      'Ad Copywriting (10 ads)',
      'Conversion Tracking',
      'Audience Targeting',
      '2 Weeks Free Optimization'
    ],
    tags: ['PPC', 'Google Ads', 'Advertising'],
    image: '/placeholder.svg'
  },
  {
    id: '4',
    title: 'Content Writing Package',
    description: 'High-quality blog posts and articles optimized for SEO.',
    longDescription: 'Get professionally written, SEO-optimized content that engages your audience and drives organic traffic. Each piece is researched, written, and edited by experienced content writers.',
    category: 'content',
    price: 150,
    priceType: 'one-time',
    vendorId: '5',
    vendorName: 'ContentCraft Pro',
    rating: 4.9,
    reviewCount: 203,
    deliveryTime: '2-3 days',
    features: [
      '1500+ Word Article',
      'SEO Optimization',
      'Keyword Integration',
      '2 Revisions Included',
      'Plagiarism Check',
      'Meta Description'
    ],
    tags: ['Content', 'Blog', 'SEO'],
    image: '/placeholder.svg',
    popular: true
  },
  {
    id: '5',
    title: 'Email Marketing Automation',
    description: 'Set up automated email sequences that convert subscribers into customers.',
    longDescription: 'Transform your email marketing with automated sequences. We design and implement welcome series, abandoned cart flows, and nurture sequences that drive conversions.',
    category: 'email',
    price: 599,
    priceType: 'one-time',
    vendorId: '6',
    vendorName: 'EmailFlow Studio',
    rating: 4.6,
    reviewCount: 45,
    deliveryTime: '5-7 days',
    features: [
      '5-Email Welcome Sequence',
      'Abandoned Cart Flow',
      'Template Design',
      'A/B Testing Setup',
      'Analytics Integration',
      'Documentation'
    ],
    tags: ['Email', 'Automation', 'Marketing'],
    image: '/placeholder.svg'
  },
  {
    id: '6',
    title: 'Video Ad Production',
    description: 'Professional video ads for social media and digital platforms.',
    longDescription: 'Create scroll-stopping video ads that capture attention and drive action. Our team handles everything from scripting to final production.',
    category: 'video',
    price: 1299,
    priceType: 'one-time',
    vendorId: '7',
    vendorName: 'VideoViral Agency',
    rating: 4.8,
    reviewCount: 78,
    deliveryTime: '7-10 days',
    features: [
      '30-Second Video Ad',
      'Professional Editing',
      'Motion Graphics',
      'Royalty-Free Music',
      '3 Format Sizes',
      '2 Revision Rounds'
    ],
    tags: ['Video', 'Ads', 'Production'],
    image: '/placeholder.svg'
  },
  {
    id: '7',
    title: 'Brand Identity Design',
    description: 'Complete brand identity package including logo, colors, and guidelines.',
    longDescription: 'Build a memorable brand from the ground up. Get a complete identity system including logo design, color palette, typography, and comprehensive brand guidelines.',
    category: 'branding',
    price: 1999,
    priceType: 'one-time',
    vendorId: '8',
    vendorName: 'BrandForge Studio',
    rating: 5.0,
    reviewCount: 34,
    deliveryTime: '10-14 days',
    features: [
      'Logo Design (3 concepts)',
      'Color Palette',
      'Typography System',
      'Brand Guidelines PDF',
      'Social Media Kit',
      'Business Card Design'
    ],
    tags: ['Branding', 'Logo', 'Identity'],
    image: '/placeholder.svg',
    popular: true
  },
  {
    id: '8',
    title: 'Analytics Dashboard Setup',
    description: 'Custom analytics dashboard with all your key metrics in one place.',
    longDescription: 'Get clarity on your marketing performance with a custom analytics dashboard. We integrate all your data sources and create visual reports that help you make better decisions.',
    category: 'analytics',
    price: 699,
    priceType: 'one-time',
    vendorId: '9',
    vendorName: 'DataDriven Co',
    rating: 4.7,
    reviewCount: 52,
    deliveryTime: '5-7 days',
    features: [
      'Google Analytics Setup',
      'Custom Dashboard',
      'Goal Tracking',
      'Monthly Report Template',
      'Training Session',
      '30-Day Support'
    ],
    tags: ['Analytics', 'Data', 'Reporting'],
    image: '/placeholder.svg'
  }
];

export const getServicesByCategory = (categoryId: string) => {
  return services.filter(service => service.category === categoryId);
};

export const getPopularServices = () => {
  return services.filter(service => service.popular);
};

export const getServiceById = (id: string) => {
  return services.find(service => service.id === id);
};
