import { Timestamp } from 'firebase/firestore';

export type UserRole = 'client' | 'vendor' | 'admin';

export interface User {
    uid: string;
    email: string;
    full_name: string;
    role: UserRole;
    created_at: Timestamp;
    photo_url?: string;
    is_active: boolean;
}

export interface Vendor {
    uid: string; // Same as User uid
    agency_name: string;
    bio: string;
    categories: string[];
    profile_image: string;
    cover_image: string;
    rating: number;
    review_count: number;
    location?: string;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface Client {
    uid: string; // Same as User uid
    display_name: string;
    preferences: string[];
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface PricingTier {
    name: string; // e.g., 'Basic', 'Standard', 'Premium'
    price: number;
    description: string;
    delivery_time_days?: number;
    revisions?: number;
    features?: string[];
}

export interface Service {
    id: string;
    vendorId: string;
    title: string;
    description: string;
    category: string;
    pricing_type: 'one-time' | 'subscription';
    base_price: number; // Lowest price or starting price
    tiers: PricingTier[];
    availability: boolean;
    images: string[];
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface Order {
    id: string;
    clientId: string;
    vendorId: string;
    serviceId: string;
    tier_name?: string; // If applicable
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    payment_type: 'credit_card' | 'paypal' | 'other';
    amount: number;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Timestamp;
    read: boolean;
}

export interface Conversation {
    id: string;
    participants: string[]; // [clientId, vendorId]
    lastMessage?: {
        content: string;
        senderId: string;
        timestamp: Timestamp;
    };
    serviceId?: string; // Optional context
    created_at: Timestamp;
    updated_at: Timestamp;
}
