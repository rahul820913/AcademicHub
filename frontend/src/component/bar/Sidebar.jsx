import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  CalendarDays, 
  Calculator, 
  BarChart3, 
  Settings,
  LogOut,
  X,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const { logout , currentUser } = useAuth();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'My Courses', path: '/courses' },
    { icon: Clock, label: 'Timetable', path: '/timetable' },
    { icon: CalendarDays, label: 'Exam Schedule', path: '/exam-schedule' },
    { icon: Calculator, label: 'Grade Calculator', path: '/grade-calculator' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* 1. Mobile Overlay (Background Dimmer) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      {/* 2. The Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:block
      `}>
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Header Section */}
            {/* ADDED: 'border-b border-gray-100 mb-4' for the separator line */}
            <div className="p-6 flex justify-between items-center border-b border-gray-200 mb-6">
              <button onClick={() => navigate('/')} className="flex items-center gap-3 pl-1 cursor-pointer hover:opacity-80 transition-opacity">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-slate-800">StudentHub</h1>
                  <p className="text-xs text-slate-500">Manage your academics</p>
                </div>
              </button>
             
              {/* Close Button (Visible only on Mobile) */}
              <button 
                onClick={closeSidebar} 
                className="lg:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="px-4 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar} 
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Footer / Profile Section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {currentUser?.fullName?.charAt(0).toUpperCase() || 'JD'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{currentUser?.fullName || 'John Doe'}</p>
                  <p className="text-xs text-slate-500">{currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1) || 'Student'} ID: 123456</p>
                </div>
              </div>
              <button 
                onClick={() => logout()} 
                className="text-slate-300 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;