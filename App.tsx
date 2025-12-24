
import React, { useState, useMemo } from 'react';
import { INITIAL_SPOTS } from './constants';
import { ParkingSpot, Booking, AIRecommendation, ParkingType } from './types';
import Navbar from './components/Navbar';
import SpotCard from './components/SpotCard';
import { getSmartRecommendations, generateListingDescription, suggestPrice } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'guest' | 'host' | 'bookings'>('guest');
  const [showMap, setShowMap] = useState(false);
  const [spots, setSpots] = useState<ParkingSpot[]>(INITIAL_SPOTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [activeFilter, setActiveFilter] = useState<ParkingType>('All');
  
  // Modals & Interactivity
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);

  // Host State
  const [newSpot, setNewSpot] = useState<Partial<ParkingSpot>>({ type: 'Driveway', pricePerHour: 10, features: [] });
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredSpots = useMemo(() => {
    let result = spots.filter(s => activeFilter === 'All' || s.type === activeFilter);
    // If we have recommendations and no active search query, we could highlight them.
    // In a real app, we might filter specifically for them.
    return result;
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
    alert(`Success! Your spot at ${spot.title} is reserved.`);
  };

  const handleCreateListing = () => {
    if (!newSpot.title || !newSpot.address) return alert("Please fill in the title and address.");
    const spot: ParkingSpot = {
      ...newSpot as ParkingSpot,
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`,
      rating: 5.0,
      reviewsCount: 0,
      hostId: 'user-1',
      location: { lat: 37.7749 + (Math.random() - 0.5) * 0.05, lng: -122.4194 + (Math.random() - 0.5) * 0.05 }
    };
    setSpots([spot, ...spots]);
    setView('guest');
    setNewSpot({ type: 'Driveway', pricePerHour: 10, features: [] });
  };

  const handleAISuggestPrice = async () => {
    if (!newSpot.address) return alert("Enter an address first.");
    const price = await suggestPrice(newSpot.address, newSpot.type || 'Driveway');
    setNewSpot(prev => ({ ...prev, pricePerHour: price }));
  };

  const handleAIGenerateDesc = async () => {
    if (!newSpot.address) return alert("Enter an address first.");
    setIsGenerating(true);
    try {
      const desc = await generateListingDescription(newSpot);
      setNewSpot(prev => ({ ...prev, description: desc }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100">
      <Navbar view={view} setView={setView} />

      {/* Persistent Filter Bar for Guest View */}
      {view === 'guest' && (
        <div className="bg-white border-b border-slate-200 sticky top-[65px] z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 overflow-x-auto no-scrollbar">
            {(['All', 'Garage', 'Driveway', 'Underground', 'Lot'] as ParkingType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                  activeFilter === type 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 relative flex flex-col overflow-hidden">
        {view === 'guest' && (
          <div className="flex-1 flex flex-col lg:flex-row h-full">
            {/* Left: Scrollable List */}
            <div className={`flex-1 p-4 lg:p-6 overflow-y-auto custom-scroll ${showMap ? 'hidden lg:block' : 'block'}`}>
              <div className="max-w-4xl mx-auto space-y-6">
                <form onSubmit={handleSmartSearch} className="relative group">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by landmark or need (e.g., 'Near Oracle Park with security')"
                    className="w-full pl-12 pr-32 py-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-xl group-hover:shadow-2xl"
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
                      className="transition-transform duration-300"
                    >
                      <SpotCard 
                        spot={spot} 
                        onBook={setSelectedSpot}
                        recommendationReason={recommendations.find(r => r.spotId === spot.id)?.reason}
                      />
                    </div>
                  ))}
                  {filteredSpots.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400">
                      No spots found in this category.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Map Visualizer */}
            <div className={`lg:w-[45%] bg-slate-100 sticky top-0 h-[calc(100vh-120px)] transition-all overflow-hidden ${showMap ? 'block flex-1' : 'hidden lg:block'}`}>
              <div className="absolute inset-0 bg-blue-50/30">
                {/* Simulated Geographic Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
                
                <div className="relative w-full h-full flex items-center justify-center">
                  {filteredSpots.map(spot => {
                    const isHovered = hoveredSpotId === spot.id;
                    const isRec = recommendations.some(r => r.spotId === spot.id);
                    // Mock coordinates to screen mapping for San Francisco area
                    const x = (spot.location.lng + 122.43) * 8000 + 50;
                    const y = (37.8 - spot.location.lat) * 8000 + 50;

                    return (
                      <div 
                        key={spot.id}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        className={`absolute transition-all duration-300 transform cursor-pointer ${isHovered ? 'scale-125 z-30' : 'z-20'}`}
                        onClick={() => setSelectedSpot(spot)}
                      >
                        <div className={`px-3 py-1.5 rounded-2xl font-black text-sm shadow-xl flex items-center gap-1.5 border-2 transition-colors ${
                          isRec 
                          ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-100' 
                          : isHovered ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200'
                        }`}>
                          ${spot.pricePerHour}
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm mx-auto -mt-2 ${isRec ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="absolute top-6 left-6 pointer-events-none">
                   <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-slate-200/50 flex flex-col pointer-events-auto">
                     <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600">Map View</span>
                     <span className="text-sm font-bold text-slate-900">SAN FRANCISCO, CA</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Toggle */}
            <button 
              onClick={() => setShowMap(!showMap)}
              className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 transition-transform active:scale-95"
            >
              {showMap ? (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg> List View</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg> Map View</>
              )}
            </button>
          </div>
        )}

        {view === 'bookings' && (
          <div className="max-w-4xl mx-auto w-full p-6 animate-in slide-in-from-bottom duration-500 overflow-y-auto">
             <h2 className="text-3xl font-bold text-slate-900 mb-8">My Bookings</h2>
             {bookings.length === 0 ? (
               <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-slate-500 font-medium mb-4">No active reservations found.</p>
                  <button onClick={() => setView('guest')} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200">Start Searching</button>
               </div>
             ) : (
                <div className="space-y-4">
                  {bookings.map(b => {
                    const spot = spots.find(s => s.id === b.spotId);
                    return (
                      <div key={b.id} className="bg-white p-5 rounded-3xl border border-slate-200 flex gap-6 group hover:border-blue-300 transition-all">
                         <img src={spot?.imageUrl} className="w-32 h-32 object-cover rounded-2xl shadow-sm" />
                         <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-lg text-slate-900">{spot?.title}</h4>
                              <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-full">Confirmed</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{spot?.address}</p>
                            <p className="text-xs text-slate-400 mt-4">Scheduled for</p>
                            <p className="text-sm font-bold text-slate-700">{new Date(b.startTime).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>
                         </div>
                         <div className="flex flex-col items-end justify-between">
                            <span className="text-xl font-black text-blue-600">${b.totalPrice}</span>
                            <button className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg">Cancel</button>
                         </div>
                      </div>
                    );
                  })}
                </div>
             )}
          </div>
        )}

        {view === 'host' && (
          <div className="max-w-3xl mx-auto w-full p-6 animate-in zoom-in-95 duration-500 overflow-y-auto">
            <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">Host Your Space</h2>
              <p className="text-slate-500 mb-10">Set up your spot and start earning within minutes.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Listing Title</label>
                    <input 
                      placeholder="e.g., Secure SOMA Garage" 
                      className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      onChange={(e) => setNewSpot(prev => ({...prev, title: e.target.value}))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Address</label>
                    <input 
                      placeholder="Full street address" 
                      className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      onChange={(e) => setNewSpot(prev => ({...prev, address: e.target.value}))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Spot Type</label>
                      <select 
                        className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none"
                        onChange={(e) => setNewSpot(prev => ({...prev, type: e.target.value as any}))}
                      >
                        <option>Driveway</option>
                        <option>Garage</option>
                        <option>Underground</option>
                        <option>Lot</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Hourly Rate</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={newSpot.pricePerHour}
                          className="w-full p-5 pl-10 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          onChange={(e) => setNewSpot(prev => ({...prev, pricePerHour: parseFloat(e.target.value)}))}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                        <button 
                          onClick={handleAISuggestPrice}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100"
                        >AI SUGGEST</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-xs font-black uppercase text-slate-400 tracking-widest">Description</label>
                      <button 
                        onClick={handleAIGenerateDesc}
                        disabled={isGenerating}
                        className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        {isGenerating ? 'WRITING...' : '✨ WRITE WITH AI'}
                      </button>
                    </div>
                    <textarea 
                      placeholder="What makes your spot great?" 
                      rows={6}
                      value={newSpot.description || ''}
                      className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
                      onChange={(e) => setNewSpot(prev => ({...prev, description: e.target.value}))}
                    />
                  </div>
                  <button 
                    onClick={handleCreateListing}
                    className="w-full py-6 bg-slate-900 text-white font-black text-lg rounded-[24px] shadow-2xl hover:bg-blue-600 transition-all active:scale-[0.98]"
                  >
                    Publish Spot
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Shared Booking Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-lg overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95">
            <div className="h-64 relative">
               <img src={selectedSpot.imageUrl} className="w-full h-full object-cover" />
               <button onClick={() => setSelectedSpot(null)} className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-black/60 backdrop-blur rounded-full text-white transition-all">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
               <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur px-4 py-1 rounded-full text-[10px] font-black uppercase text-slate-900 shadow-lg">
                 {selectedSpot.type}
               </div>
            </div>
            <div className="p-10">
               <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 leading-tight">{selectedSpot.title}</h3>
                    <p className="text-slate-500 font-medium">{selectedSpot.address}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-black text-blue-600">${selectedSpot.pricePerHour}</p>
                    <p className="text-xs font-bold text-slate-400">per hour</p>
                 </div>
               </div>
               
               <p className="text-slate-600 mb-10 leading-relaxed">{selectedSpot.description}</p>

               <div className="bg-slate-50 p-6 rounded-3xl mb-10 flex justify-between items-center border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Duration</span>
                    <span className="text-lg font-bold text-slate-700">2 Hours</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Price</span>
                    <p className="text-2xl font-black text-slate-900">${selectedSpot.pricePerHour * 2}</p>
                  </div>
               </div>

               <button 
                  onClick={() => confirmBooking(selectedSpot)} 
                  className="w-full py-6 bg-blue-600 text-white font-black text-xl rounded-3xl hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
               >
                 Confirm Reservation
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
