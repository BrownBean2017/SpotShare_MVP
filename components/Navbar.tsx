
import React from 'react';

interface NavbarProps {
  view: 'guest' | 'host' | 'bookings';
  setView: (view: 'guest' | 'host' | 'bookings') => void;
}

const Navbar: React.FC<NavbarProps> = ({ view, setView }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setView('guest')}
        >
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">ParkShare <span className="text-blue-600">Simplified</span></span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => setView('guest')}
            className={`font-medium transition-colors ${view === 'guest' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
          >
            Find Parking
          </button>
          <button 
            onClick={() => setView('bookings')}
            className={`font-medium transition-colors ${view === 'bookings' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
          >
            My Bookings
          </button>
          <button 
            onClick={() => setView('host')}
            className={`px-4 py-2 rounded-full border border-slate-200 font-medium transition-all ${view === 'host' ? 'bg-slate-900 text-white border-slate-900' : 'hover:bg-slate-50 text-slate-700'}`}
          >
            Switch to Hosting
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
             <img src="https://picsum.photos/seed/user/100/100" alt="profile" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
