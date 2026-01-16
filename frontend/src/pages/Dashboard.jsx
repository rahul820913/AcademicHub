import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, BookOpen, AlertTriangle, Clock, MoreVertical, 
  AlertCircle, Check, X, Loader2 
} from 'lucide-react';
import CourseCard from '../component/cards/CourseCard';


// --- Helper Components ---

const StatCard = ({ icon: Icon, label, value, subtext, color, onClick }) => {
  // Define themes with gradients, borders, and icon styles
  const themes = {
    blue: {
      wrapper: "bg-gradient-to-br from-blue-50/80 to-white border-blue-100 hover:shadow-blue-100",
      icon: "bg-blue-100 text-blue-600",
      decoration: "bg-blue-400"
    },
    red: {
      wrapper: "bg-gradient-to-br from-red-50/80 to-white border-red-100 hover:shadow-red-100",
      icon: "bg-red-100 text-red-600",
      decoration: "bg-red-400"
    },
    slate: {
      wrapper: "bg-gradient-to-br from-slate-50/80 to-white border-slate-200 hover:shadow-slate-200",
      icon: "bg-slate-100 text-slate-600",
      decoration: "bg-slate-400"
    }
  };

  const theme = themes[color] || themes.slate;

  return (
    <div 
      onClick={onClick}
      className={`
        relative group overflow-hidden
        p-6 rounded-2xl border
        transition-all duration-300 ease-out
        ${theme.wrapper}
        ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''}
      `}
    >
      {/* Decorative blurred glow in the corner */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-3xl ${theme.decoration} transition-opacity group-hover:opacity-20`} />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1 tracking-wide uppercase">
            {label}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {value}
          </h3>
        </div>
        
        <div className={`p-3 rounded-xl ${theme.icon} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center">
        <span className="text-xs font-medium text-slate-400 bg-white/60 px-2 py-1 rounded-lg backdrop-blur-sm border border-slate-100">
          {subtext}
        </span>
      </div>
    </div>
  );
};

const ScheduleItem = ({ id, title, code, time, location, color, initialStatus, onMark }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  const handleMark = (type) => {
    setStatus(type);
    setShowMenu(false);
    onMark(id, type); // Call parent function to hit API
  };

  return (
    <div className="flex items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow relative">
      <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center mr-4 ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
        <Clock className="w-5 h-5 mb-1" />
        <span className="text-xs font-bold">{time}</span>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-800">{title}</h3>
        <div className="text-sm text-slate-500">{code}</div>
        <div className="flex items-center text-xs text-slate-400 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
          {location}
        </div>
        
        {status && (
          <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${status === 'present' ? 'text-green-600' : 'text-red-500'}`}>
             {status === 'present' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
             Marked: {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        )}
      </div>

      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="text-slate-300 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-10 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
            <button onClick={() => handleMark('present')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" /> Present
            </button>
            <button onClick={() => handleMark('absent')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 border-t border-gray-50">
              <X className="w-4 h-4" /> Absent
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



// --- Main Page Component ---
export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState([]);
  
  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      try {
        const headers = { 'user-id': currentUser.id };
        
        // 1. Get Schedule
        const scheduleRes = await axios.get('http://localhost:5000/api/dashboard/schedule/today', { headers });
        setSchedule(scheduleRes.data);

        // 2. Get Stats (My Courses)
        const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats', { headers });
        setStats(statsRes.data);

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Mark Attendance Function
  const handleMarkAttendance = async (timetableId, status) => {
    try {
      await axios.post('http://localhost:5000/api/dashboard/mark', 
        { timetable_id: timetableId, status }, 
        { headers: { 'user-id': currentUser.id } }
      );
      // Optional: Refresh stats here if you want real-time update of percentage
    } catch (err) {
      alert("Failed to mark attendance");
    }
  };

  // derived values
  const totalCourses = stats.length;
  const lowAttendanceCount = stats.filter(c => {
     const p = c.total_classes > 0 ? Math.round((c.attended / c.total_classes) * 100) : 0;
     return p < 75;
  }).length;

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {currentUser?.fullName || 'Student'}!</p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={BookOpen} 
          label="Total Courses" 
          value={totalCourses} 
          subtext="Enrolled subjects" 
          color="slate"
          onClick={() => navigate('/courses')}
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Low Attendance" 
          value={lowAttendanceCount} 
          subtext="Courses below 75%" 
          color={lowAttendanceCount > 0 ? "red" : "blue"} 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Today's Classes" 
          value={schedule.length} 
          subtext="Scheduled for today" 
          color="blue" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Today's Schedule</h2>
          {schedule.length === 0 ? (
             <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500">No classes scheduled for today.</div>
          ) : (
             <div className="space-y-4">
                {schedule.map(item => (
                  <ScheduleItem 
                    key={item.id}
                    id={item.id}
                    time={item.time} 
                    title={item.subject} 
                    code={item.code} 
                    location={item.room} 
                    color={item.color}
                    initialStatus={item.marked_status}
                    onMark={handleMarkAttendance}
                  />
                ))}
             </div>
          )}
        </div>

        {/* Right Column: My Courses Stats */}
        <div className="lg:col-span-7">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Course Performance</h2>
          {stats.length === 0 ? (
             <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500">
                No attendance data yet. Mark attendance to see stats.
             </div>
          ) : (
             <div className="grid grid-cols-1  gap-6">
               {stats.map((course, idx) => {
                 const total = parseInt(course.total_classes);
                 const attended = parseInt(course.attended);
                 const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
                 
                 return (
                   <CourseCard 
                     key={idx}
                     title={course.subject}
                     code={course.code}
                     percentage={percentage}
                     attended={attended}
                     total={total}
                     warning={percentage < 75 && total > 0}
                     onViewDetails={() => navigate(`/attendance/${course.code}`)}
                   />
                 );
               })}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}