import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, XCircle, MinusCircle, HelpCircle,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Loader2, X, Check, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- Helper Components ---

const StatItem = ({ label, value, color, icon: Icon }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-500 border-red-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border mb-3 last:mb-0 ${styles[color]}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
};

const CalendarDay = ({ day, status, isValidDay, onClick }) => {
  if (!day) return <div className="h-14 w-14"></div>; 

  let statusColor = "";
  if (status === 'present') statusColor = "bg-green-500";
  else if (status === 'absent') statusColor = "bg-red-500";
  else if (status === 'noclass') statusColor = "bg-slate-300";

  // Style logic: If it's a valid class day but no status, show it's clickable
  const isClickable = isValidDay;
  const borderClass = isClickable 
    ? "border-slate-100 hover:border-blue-400 hover:bg-blue-50 cursor-pointer" 
    : "border-transparent opacity-50 cursor-not-allowed";

  return (
    <div 
      onClick={() => isClickable && onClick(day)}
      className={`h-14 w-14 flex flex-col items-center justify-center rounded-xl border transition-all relative group ${borderClass}`}
    >
      <span className={`text-sm font-medium ${status ? 'text-slate-800' : 'text-slate-400'}`}>{day}</span>
      {status ? (
        <span className={`w-2 h-2 rounded-full mt-1 ${statusColor}`}></span>
      ) : (
        isClickable && <span className="opacity-0 group-hover:opacity-100 absolute bottom-1 text-[10px] text-blue-500 font-bold">+</span>
      )}
    </div>
  );
};

// --- Modal Component ---
const MarkAttendanceModal = ({ isOpen, onClose, date, onMark, loading }) => {
  if (!isOpen) return null;
  const displayDate = date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Mark Attendance</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6">
          <p className="text-center text-slate-500 mb-6">
            Update status for <br/> <span className="font-bold text-slate-800 text-lg">{displayDate}</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onMark('present')}
              disabled={loading}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center"><Check className="w-6 h-6" /></div>
              <span className="font-bold">Present</span>
            </button>
            <button 
              onClick={() => onMark('absent')}
              disabled={loading}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
               <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center"><X className="w-6 h-6" /></div>
              <span className="font-bold">Absent</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---
export default function AttendanceMarkPage() {
  const { currentUser } = useAuth();
  const { courseId } = useParams(); // Expecting route: /attendance/:courseId (e.g., CS202)
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [attendanceMap, setAttendanceMap] = useState({}); // { "2026-01-15": "present" }
  const [courseDetails, setCourseDetails] = useState(null);
  const [validDays, setValidDays] = useState([]); // ['Monday', 'Wednesday']
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Fetch Course Data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !courseId) return;
      try {
        const res = await axios.get(`https://studenthub-gamma.vercel.app/api/attendance/${courseId}`, {
          headers: { 'user-id': currentUser.id }
        });
        
        setCourseDetails(res.data.details);
        setValidDays(res.data.scheduleDays);
        
        // Transform Array to Map for easier lookup
        const map = {};
        res.data.history.forEach(record => {
          // Ensure date is string YYYY-MM-DD
          const d = new Date(record.date).toISOString().split('T')[0];
          map[d] = record.status;
        });
        setAttendanceMap(map);

      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, courseId]);

  // 2. Mark Attendance
  const handleMark = async (status) => {
    setActionLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
   
    const d = new Date(year, month, selectedDay);
    const dateKey = d.toLocaleDateString('en-CA'); 

    try {
      await axios.post('https://studenthub-gamma.vercel.app/api/attendance/mark', {
        courseCode: courseId,
        date: dateKey,
        status
      }, {
        headers: { 'user-id': currentUser.id }
      });

      // Update UI
      setAttendanceMap(prev => ({
        ...prev,
        [dateKey]: status
      }));
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setActionLoading(false);
    }
  };

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay(); 

  const calendarGrid = useMemo(() => {
    const grid = [];
    for (let i = 0; i < firstDayOffset; i++) grid.push({ day: null });
    
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateKey = d.toLocaleDateString('en-CA');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if this date corresponds to a scheduled class day
      const isValid = validDays.includes(dayName);

      grid.push({ 
        day: i, 
        fullDate: dateKey, 
        status: attendanceMap[dateKey],
        isValid 
      });
    }
    return grid;
  }, [year, month, attendanceMap, validDays]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  if (!courseDetails) return <div className="p-8 text-center text-slate-500">Course not found.</div>;

  // Stats
  const totalClasses = Object.keys(attendanceMap).length;
  const attended = Object.values(attendanceMap).filter(s => s === 'present').length;
  const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;

  return (
    <div>
      <header className="mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-slate-600 mb-4 text-sm font-medium">
           <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">{courseDetails.subject}</h1>
                <p className="text-slate-500 mt-1">{courseDetails.code} • {courseDetails.room}</p>
            </div>
            <div className="hidden md:block">
                 <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Attendance</div>
                 </div>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-800">Attendance Log</h2>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                <span className="font-semibold text-slate-700 w-32 text-center">{currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-7 gap-3 mb-3 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-3">
                {calendarGrid.map((item, index) => (
                  <CalendarDay 
                    key={index} 
                    day={item.day} 
                    status={item.status} 
                    isValidDay={item.isValid}
                    onClick={(d) => { setSelectedDay(d); setIsModalOpen(true); }}
                  />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-600"><span className="w-3 h-3 rounded-full bg-green-500"></span> Present</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><span className="w-3 h-3 rounded-full bg-red-500"></span> Absent</div>
              <div className="flex items-center gap-2 text-sm text-slate-600"><span className="w-3 h-3 rounded-full border border-blue-200 bg-blue-50"></span> Scheduled Class</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-6">Summary</h3>
            <div className="space-y-2">
              <StatItem label="Total Classes" value={totalClasses} color="blue" icon={CheckCircle2} />
              <StatItem label="Attended" value={attended} color="green" icon={CheckCircle2} />
              <StatItem label="Missed" value={totalClasses - attended} color="red" icon={XCircle} />
              <StatItem label="Rate" value={`${percentage}%`} color="slate" icon={MinusCircle} />
            </div>
          </div>
          
          {percentage < 75 ? (
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <h3 className="font-bold text-red-800 mb-2">Warning</h3>
                <p className="text-sm text-red-700 leading-relaxed">
                  Your attendance is below 75%. You need to attend the next few classes to recover.
                </p>
              </div>
          ) : (
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <h3 className="font-bold text-green-800 mb-2">On Track</h3>
                <p className="text-sm text-green-700 leading-relaxed">
                  You are maintaining good attendance. Keep it up!
                </p>
              </div>
          )}
        </div>
      </div>

      <MarkAttendanceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={new Date(year, month, selectedDay)}
        onMark={handleMark}
        loading={actionLoading}
      />
    </div>
  );
}