
export type ParkingType = 'Driveway' | 'Garage' | 'Underground' | 'Street' | 'Lot' | 'All';

export interface ParkingSpot {
  id: string;
  title: string;
  description: string;
  address: string;
  pricePerHour: number;
  type: Exclude<ParkingType, 'All'>;
  features: string[];
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  hostId: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Booking {
  id: string;
  spotId: string;
  userId: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface AIRecommendation {
  spotId: string;
  reason: string;
  groundingLink?: string;
}

export interface Filters {
  type: ParkingType;
  maxPrice: number;
}
