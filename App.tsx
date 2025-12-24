
import React, { useState, useMemo } from 'react';
import { INITIAL_SPOTS } from './constants.tsx';
import { ParkingSpot, Booking, AIRecommendation, ParkingType } from './types.ts';
import Navbar from './components/Navbar.tsx';
import SpotCard from './components/SpotCard.tsx';
import { getSmartRecommendations, generateListingDescription, suggestPrice } from './services/geminiService.ts';

const App: React.FC = () => {
  const [view, setView] = useState<'guest' | 'host' | 'bookings'>('guest');
  const [showMap, setShowMap] = useState(false);
  const [spots, setSpots] = useState<ParkingSpot[]>(INITIAL_SPOTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [activeFilter, setActiveFilter] = useState<ParkingType>('All');
  
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);
  const [newSpot, setNewSpot] = useState<Partial<ParkingSpot>>({ type: 'Driveway', pricePerHour: 10 });
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredSpots = useMemo(() => {
    return spots.filter(s => activeFilter === 'All' || s.type === activeFilter);
  }, [spots, activeFilter]);

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setRecommendations([]);
      return;
    }
    setIsSearching(true);
    try {
      const recs = await getSmartRecommendations(searchQuery, spots);
      setRecommendations(recs);
    } finally {
      setIsSearching(false);
    }
  };

  const confirmBooking = (spot: ParkingSpot) => {
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      spotId: spot.id,
      userId: 'user-1',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
      totalPrice: spot.pricePerHour * 2,
      status: 'upcoming'
    };
    setBookings([newBooking, ...bookings]);
    setSelectedSpot(null);
  };

  const handleCreateListing = () => {
    if (!newSpot.title || !newSpot.address) return alert("Please fill title and address.");
    const spot: ParkingSpot = {
      ...newSpot as ParkingSpot,
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`,
      rating: 5.0,
      reviewsCount: 0,
      hostId: 'user-1',
      location: { 
        lat: 37.7749 + (Math.random() - 0.5) * 0.05, 
        lng: -122.4194 + (Math.random() - 0.5) * 0.05 
      },
      description: newSpot.description || "A convenient parking spot.",
      features: []
    };
    setSpots([spot, ...spots]);
    setView('guest');
    setNewSpot({ type: 'Driveway', pricePerHour: 10 });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      <Navbar view={view} setView={setView} />

      {view === 'guest' && (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
            {(['All', 'Garage', 'Driveway', 'Underground', 'Lot'] as ParkingType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                  activeFilter === type 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 relative flex flex-col h-[calc(100vh-120px)] overflow-hidden">
        {view === 'guest' && (
          <div className="flex-1 flex flex-col lg:flex-row h-full">
            {/* List View */}
            <div className={`flex-1 p-4 lg:p-6 overflow-y-auto custom-scroll ${showMap ? 'hidden lg:block' : 'block'}`}>
              <div className="max-w-4xl mx-auto space-y-6">
                <form onSubmit={handleSmartSearch} className="relative group">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Where are you heading? (e.g., 'Near the ballpark')"
                    className="w-full pl-12 pr-32 py-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-xl"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <button 
                    disabled={isSearching}
                    className="absolute right-3 top-3 bottom-3 px-8 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Search'}
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  {filteredSpots.map(spot => (
                    <div 
                      key={spot.id} 
                      onMouseEnter={() => setHoveredSpotId(spot.id)}
                      onMouseLeave={() => setHoveredSpotId(null)}
                    >
                      <SpotCard 
                        spot={spot} 
                        onBook={setSelectedSpot}
                        recommendationReason={recommendations.find(r => r.spotId === spot.id)?.reason}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Map View */}
            <div className={`lg:w-[45%] bg-slate-100 relative h-full transition-all overflow-hidden ${showMap ? 'block flex-1' : 'hidden lg:block'}`}>
               <div className="absolute inset-0 bg-blue-50/30">
                 {/* Visual Mock Map Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
                
                <div className="relative w-full h-full">
                  {filteredSpots.map(spot => {
                    const isHovered = hoveredSpotId === spot.id;
                    const isRec = recommendations.some(r => r.spotId === spot.id);
                    const x = (spot.location.lng + 122.43) * 8000 + 50;
                    const y = (37.8 - spot.location.lat) * 8000 + 50;

                    return (
                      <div 
                        key={spot.id}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        className={`absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${isHovered ? 'scale-125 z-30' : 'z-20'}`}
                        onClick={() => setSelectedSpot(spot)}
                      >
                        <div className={`px-3 py-1.5 rounded-2xl font-black text-xs shadow-xl flex items-center gap-1.5 border-2 ${
                          isRec ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-100' : 'bg-white text-slate-900 border-slate-200'
                        }`}>
                          ${spot.pricePerHour}
                        </div>
                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm mx-auto -mt-1.5 ${isRec ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Floating Toggle Button */}
            <button 
              onClick={() => setShowMap(!showMap)}
              className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 active:scale-95 transition-transform"
            >
              {showMap ? 'Show List' : 'Show Map'}
            </button>
          </div>
        )}

        {view === 'bookings' && (
          <div className="max-w-4xl mx-auto w-full p-6 h-full overflow-y-auto">
             <h2 className="text-3xl font-black text-slate-900 mb-8">Reservations</h2>
             {bookings.length === 0 ? (
               <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium mb-4">No active bookings.</p>
                  <button onClick={() => setView('guest')} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold">Find Parking</button>
               </div>
             ) : (
                <div className="space-y-4">
                  {bookings.map(b => {
                    const spot = spots.find(s => s.id === b.spotId);
                    return (
                      <div key={b.id} className="bg-white p-5 rounded-3xl border border-slate-200 flex gap-6 hover:border-blue-300 transition-all">
                        <img src={spot?.imageUrl} className="w-24 h-24 object-cover rounded-2xl" />
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{spot?.title}</h4>
                          <p className="text-sm text-slate-500">{new Date(b.startTime).toLocaleDateString()}</p>
                          <p className="text-blue-600 font-black mt-2">${b.totalPrice}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
             )}
          </div>
        )}

        {view === 'host' && (
          <div className="max-w-3xl mx-auto w-full p-6 h-full overflow-y-auto">
            <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-2xl">
              <h2 className="text-4xl font-black text-slate-900 mb-2">Host Your Space</h2>
              <p className="text-slate-500 mb-10">Start earning from your empty spot today.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <input placeholder="Listing Title" className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100" onChange={(e) => setNewSpot(prev => ({...prev, title: e.target.value}))} />
                  <input placeholder="Address" className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100" onChange={(e) => setNewSpot(prev => ({...prev, address: e.target.value}))} />
                  <div className="flex gap-4">
                    <select className="flex-1 p-5 rounded-2xl bg-slate-50 border border-slate-100 appearance-none" onChange={(e) => setNewSpot(prev => ({...prev, type: e.target.value as any}))}>
                      <option>Driveway</option><option>Garage</option><option>Lot</option>
                    </select>
                    <div className="relative flex-1">
                      <input type="number" value={newSpot.pricePerHour} className="w-full p-5 pl-8 rounded-2xl bg-slate-50 border border-slate-100" onChange={(e) => setNewSpot(prev => ({...prev, pricePerHour: parseFloat(e.target.value)}))} />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <button onClick={async () => { const p = await suggestPrice(newSpot.address || 'San Francisco', newSpot.type || 'Driveway'); setNewSpot(prev => ({...prev, pricePerHour: p})); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">AI SUGGEST</button>
                    </div>
                  </div>
                  <button onClick={handleCreateListing} className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:bg-blue-600 transition-all">Publish Listing</button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-slate-400 uppercase">Description</label>
                    <button onClick={async () => {setIsGenerating(true); const d = await generateListingDescription(newSpot); setNewSpot(p => ({...p, description: d})); setIsGenerating(false);}} className="text-[10px] font-black text-blue-600">✨ AI WRITE</button>
                  </div>
                  <textarea rows={8} value={newSpot.description || ''} className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 resize-none" onChange={(e) => setNewSpot(prev => ({...prev, description: e.target.value}))} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="h-64 relative">
               <img src={selectedSpot.imageUrl} className="w-full h-full object-cover" />
               <button onClick={() => setSelectedSpot(null)} className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur rounded-full text-white transition-all hover:scale-110">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <div className="p-10">
               <h3 className="text-3xl font-black text-slate-900 leading-tight">{selectedSpot.title}</h3>
               <p className="text-slate-500 mb-6">{selectedSpot.address}</p>
               <p className="text-slate-600 mb-10 leading-relaxed text-sm">{selectedSpot.description}</p>
               <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl mb-10">
                  <div><p className="text-[10px] font-black text-slate-400 uppercase">Rate</p><p className="text-2xl font-black text-slate-900">${selectedSpot.pricePerHour}/hr</p></div>
                  <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase">Total (2hrs)</p><p className="text-3xl font-black text-blue-600">${selectedSpot.pricePerHour * 2}</p></div>
               </div>
               <button onClick={() => confirmBooking(selectedSpot)} className="w-full py-6 bg-blue-600 text-white font-black text-xl rounded-3xl shadow-2xl active:scale-95 transition-transform hover:bg-blue-700">Confirm Reservation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
