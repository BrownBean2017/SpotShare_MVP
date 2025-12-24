import React from 'react';
import { ParkingSpot } from '../types.ts';

interface SpotCardProps {
  spot: ParkingSpot;
  onBook: (spot: ParkingSpot) => void;
  recommendationReason?: string;
}

const SpotCard: React.FC<SpotCardProps> = ({ spot, onBook, recommendationReason }) => {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all hover:shadow-md group flex flex-col ${recommendationReason ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200'}`}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={spot.imageUrl} 
          alt={spot.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {recommendationReason && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-tighter">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            AI Pick
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{spot.type}</span>
          <div className="flex items-center gap-1 text-xs font-bold">
            <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            {spot.rating} <span className="text-slate-400 font-medium">({spot.reviewsCount})</span>
          </div>
        </div>
        
        <h3 className="font-bold text-slate-900 text-base mb-1 truncate">{spot.title}</h3>
        <p className="text-slate-500 text-xs truncate mb-3">{spot.address}</p>
        
        {recommendationReason && (
          <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-[10px] text-blue-800 leading-tight">"{recommendationReason}"</p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
          <span className="text-slate-900 font-bold text-sm">${spot.pricePerHour}<span className="text-slate-400 font-normal">/hr</span></span>
          <button 
            onClick={() => onBook(spot)}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg transition-all active:scale-95 hover:bg-blue-600"
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpotCard;