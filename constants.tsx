
import { ParkingSpot } from './types';

export const INITIAL_SPOTS: ParkingSpot[] = [
  {
    id: '1',
    title: 'Downtown Secure Underground',
    description: 'Modern, well-lit underground parking right in the financial district. 24/7 security and wide bays.',
    address: '450 Montgomery St, San Francisco, CA',
    pricePerHour: 12,
    type: 'Underground',
    features: ['EV Charging', 'CCTV', 'Security Guard'],
    imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 128,
    hostId: 'host-1',
    location: { lat: 37.7937, lng: -122.4025 }
  },
  {
    id: '2',
    title: 'Private Driveway near Stadium',
    description: 'Perfect for game days. Just a 5-minute walk from the entrance. No blocking, easy access.',
    address: '24 Willie Mays Plaza, San Francisco, CA',
    pricePerHour: 25,
    type: 'Driveway',
    features: ['Easy Access', 'Gated'],
    imageUrl: 'https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    reviewsCount: 45,
    hostId: 'host-2',
    location: { lat: 37.7786, lng: -122.3893 }
  },
  {
    id: '3',
    title: 'Clean Residential Garage',
    description: 'Extra wide garage in a quiet neighborhood. Safe for high-end vehicles.',
    address: '1200 Pacific Ave, San Francisco, CA',
    pricePerHour: 8,
    type: 'Garage',
    features: ['Indoors', 'Quiet'],
    imageUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 67,
    hostId: 'host-3',
    location: { lat: 37.7950, lng: -122.4172 }
  },
  {
    id: '4',
    title: 'Mission District Spot',
    description: 'Standard driveway space. Close to popular bars and restaurants.',
    address: '890 Valencia St, San Francisco, CA',
    pricePerHour: 6,
    type: 'Driveway',
    features: ['Affordable'],
    imageUrl: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=800',
    rating: 4.5,
    reviewsCount: 89,
    hostId: 'host-4',
    location: { lat: 37.7593, lng: -122.4215 }
  }
];
