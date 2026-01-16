import React from 'react';
import { 
  Bell, 
  Search, 
  Menu,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();



  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
      
      {/* Left Side: Mobile Menu & Search */}
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Toggle */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center relative w-64 md:w-96">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search for courses, assignments..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Right Side: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Help & Messages */}
        <button 
          onClick={() => navigate('*')} 
          className="hidden sm:flex p-2 rounded-full text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors relative group"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="absolute top-10 right-0 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Help Center
          </span>
        </button>

        <button 
          onClick={() => navigate('*')} 
          className="hidden sm:flex p-2 rounded-full text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/announcements')} 
          className="p-2 rounded-full text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* Mini Profile (Right) */}
        <button 
          onClick={() => navigate('/profile')} 
          className="flex items-center gap-3 pl-1 hover:opacity-80 transition-opacity text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
            {currentUser?.fullName?.charAt(0).toUpperCase()+currentUser?.fullName?.charAt(1).toUpperCase() || 'JD'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-slate-700 leading-tight">{currentUser?.fullName || 'John Doe'}</p>
            <p className="text-[10px] text-slate-500 font-medium">{currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1) || 'Student'} </p>
          </div>
        </button>

      </div>
    </header>
  );
};

export default Navbar;