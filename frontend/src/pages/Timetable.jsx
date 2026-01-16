import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Plus, MapPin, X, Check, ChevronLeft, ChevronRight, 
  Calendar as CalendarIcon, Clock, Loader2, Trash2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

// --- Configuration ---
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const colors = ['blue', 'purple', 'cyan', 'orange', 'pink', 'green', 'teal', 'red'];
const allDayTimeOptions = ['6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM'];

// --- Helpers ---
const parseTimeToInt = (timeStr) => {
  if (!timeStr) return 0;
  const [hour, modifier] = timeStr.split(' ');
  let h = parseInt(hour);
  if (h === 12) h = 0;
  if (modifier === 'PM') h += 12;
  return h;
};

const formatIntToTime = (h) => {
  const modifier = h >= 12 ? 'PM' : 'AM';
  let hour = h % 12;
  if (hour === 0) hour = 12;
  return `${hour} ${modifier}`;
};

const getColorStyles = (color, type) => {
  const styles = {
    blue: { main: 'bg-blue-100 text-blue-700 border-l-4 border-blue-500', dot: 'bg-blue-500' },
    purple: { main: 'bg-purple-100 text-purple-700 border-l-4 border-purple-500', dot: 'bg-purple-500' },
    cyan: { main: 'bg-cyan-100 text-cyan-700 border-l-4 border-cyan-500', dot: 'bg-cyan-500' },
    orange: { main: 'bg-orange-100 text-orange-700 border-l-4 border-orange-500', dot: 'bg-orange-500' },
    pink: { main: 'bg-pink-100 text-pink-700 border-l-4 border-pink-500', dot: 'bg-pink-500' },
    green: { main: 'bg-green-100 text-green-700 border-l-4 border-green-500', dot: 'bg-green-500' },
    teal: { main: 'bg-teal-100 text-teal-700 border-l-4 border-teal-500', dot: 'bg-teal-500' },
    red: { main: 'bg-red-100 text-red-700 border-l-4 border-red-500', dot: 'bg-red-500' },
  };
  return styles[color]?.[type] || 'bg-gray-100 text-gray-700';
};

// --- Sub-Components ---

// 1. WEEK VIEW CARD (Handles Duration Height)
const WeekClassCard = ({ data, onDelete }) => {
  if (!data) return <div className="h-full w-full bg-slate-50/30 border border-slate-100/50 rounded-lg" />;
  
  // Calculate height: 100% per hour + gap compensation
  const heightStyle = data.duration > 1 
    ? { height: `calc(${data.duration * 100}% + ${(data.duration - 1) * 0.75}rem)`, zIndex: 10 } 
    : {};

  return (
    <div 
      style={heightStyle}
      className={`group relative h-full w-full p-2 rounded-lg text-xs hover:brightness-95 transition-all shadow-sm flex flex-col justify-center gap-1 ${getColorStyles(data.color, 'main')}`}
    >
      <div className="flex justify-between items-start">
        <span className="font-bold leading-tight line-clamp-2">{data.subject}</span>
        <button 
            onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
            className="opacity-0 group-hover:opacity-100 p-1 bg-white/50 rounded-full hover:bg-white text-red-600 transition-opacity"
            title="Delete Class"
        >
            <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="flex items-center opacity-80 gap-1">
        <MapPin className="w-3 h-3" /> {data.room}
      </div>
      {data.duration > 1 && (
        <div className="absolute bottom-2 right-2 text-[10px] font-bold opacity-60 bg-white/30 px-1.5 rounded">
            {data.duration}h
        </div>
      )}
    </div>
  );
};

// 2. MONTH VIEW CELL (Handles List of Classes)
const MonthDayCell = ({ dayNumber, classes, isToday }) => {
  if (!dayNumber) return <div className="bg-slate-50/30 min-h-[100px]"></div>;

  return (
    <div className={`min-h-[100px] bg-white border border-gray-100 p-2 transition-colors hover:bg-slate-50 ${isToday ? 'bg-blue-50/30' : ''}`}>
      <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-600 bg-blue-100 w-7 h-7 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
        {dayNumber}
      </div>
      <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
        {classes.map((cls, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[10px] px-1.5 py-1 rounded bg-slate-100 text-slate-600 truncate border-l-2 border-transparent hover:border-blue-400 transition-all">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getColorStyles(cls.color, 'dot')}`}></span>
            <span className="truncate font-medium">{cls.time} - {cls.subject}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. ADD CLASS MODAL
const AddClassModal = ({ isOpen, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    day: 'Monday', time: '9 AM', duration: '1', subject: '', code: '', room: '', color: 'blue'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, duration: parseInt(formData.duration) });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Add New Class</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 mb-1">Day</label>
              <select className="w-full p-2 border rounded-lg text-sm" value={formData.day} onChange={e => setFormData({...formData, day: e.target.value})}>
                {weekDays.filter(d => d !== 'Sunday').map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 mb-1">Start</label>
              <select className="w-full p-2 border rounded-lg text-sm" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}>
                {allDayTimeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 mb-1">Duration</label>
              <select className="w-full p-2 border rounded-lg text-sm" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})}>
                <option value="1">1 Hour</option>
                <option value="2">2 Hours</option>
                <option value="3">3 Hours</option>
              </select>
            </div>
          </div>
          <input required className="w-full p-2 border rounded-lg text-sm" placeholder="Subject Name" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input required className="w-full p-2 border rounded-lg text-sm" placeholder="Code (e.g. CS101)" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            <input required className="w-full p-2 border rounded-lg text-sm" placeholder="Room" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Color Label</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button key={c} type="button" onClick={() => setFormData({...formData, color: c})} className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorStyles(c, 'dot')} ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : 'opacity-70'}`}>
                  {formData.color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-400 flex justify-center items-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add to Schedule"}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function TimetablePage() {
  const { currentUser } = useAuth(); 
  const [view, setView] = useState('week'); 
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Fetch Schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!currentUser) return;
      try {
        const res = await axios.get('https://studenthub-gamma.vercel.app/api/timetable', {
          headers: { 'user-id': currentUser.id }
        });
        setSchedule(res.data);
      } catch (err) {
        console.error("Failed to load schedule", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [currentUser]);

  // 2. Add Class
  const handleAddClass = async (newClassData) => {
    setActionLoading(true);
    try {
      const res = await axios.post('https://studenthub-gamma.vercel.app/api/timetable', newClassData, {
        headers: { 'user-id': currentUser.id }
      });
      setSchedule([...schedule, res.data]); 
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to add class. Please check server.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Delete Class
  const handleDeleteClass = async (classId) => {
    if(!window.confirm("Are you sure you want to delete this class?")) return;
    
    // Optimistic Update
    const previousSchedule = [...schedule];
    setSchedule(schedule.filter(c => c.id !== classId)); 

    try {
      await axios.delete(`https://studenthub-gamma.vercel.app/api/timetable/${classId}`, {
        headers: { 'user-id': currentUser.id }
      });
    } catch (err) {
      alert("Failed to delete class from server");
      setSchedule(previousSchedule);
    }
  };

  // 4. Time Slot Calculation (Week View)
  const dynamicTimeSlots = useMemo(() => {
    if (schedule.length === 0) return ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM']; 
    let minHour = 24, maxHour = 0;
    schedule.forEach(cls => {
      const h = parseTimeToInt(cls.time);
      if (h < minHour) minHour = h;
      const endH = h + (cls.duration || 1) - 1;
      if (endH > maxHour) maxHour = endH;
    });
    
    let start = minHour; 
    if (minHour > maxHour) { start = 9; maxHour = 16; }
    
    const slots = [];
    for (let i = start; i <= maxHour; i++) slots.push(formatIntToTime(i));
    return slots;
  }, [schedule]);

  // 5. Calendar Grid Calculation (Month View)
  const getMonthData = () => { 
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // Day of week (0-6)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const monthDays = getMonthData();

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
             <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-white rounded-md shadow-sm transition-all"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
             <button onClick={() => changeMonth(1)} className="p-1 hover:bg-white rounded-md shadow-sm transition-all"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
           </div>
           <h2 className="text-xl font-bold text-slate-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setView('week')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><Clock className="w-4 h-4" /> Week</button>
             <button onClick={() => setView('month')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><CalendarIcon className="w-4 h-4" /> Month</button>
           </div>
           <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200">
             <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Class</span>
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        
        {/* WEEK VIEW RENDER */}
        {view === 'week' && (
          <div className="overflow-auto flex-1 p-4">
            <div className="min-w-[1000px] lg:w-full">
               <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-3 mb-2 sticky top-0 bg-white z-10">
                 <div className="text-xs font-bold text-slate-400 py-2 text-right pr-2">TIME</div>
                 {weekDays.map(d => (
                   <div key={d} className={`text-center py-2 text-sm font-bold uppercase tracking-wider ${d === 'Monday' ? 'text-blue-600' : 'text-slate-500'}`}>{d.slice(0, 3)}</div>
                 ))}
               </div>
               <div className="space-y-3">
                 {dynamicTimeSlots.map(time => (
                   <div key={time} className="grid grid-cols-[60px_repeat(7,1fr)] gap-3 h-24">
                     <div className="text-xs font-medium text-slate-400 text-right pr-2 pt-2">{time}</div>
                     {weekDays.map(day => {
                       const classInfo = schedule.find(s => s.day === day && s.time === time);
                       return (
                         <div key={`${day}-${time}`} className="h-full border-t border-gray-50 relative">
                           {classInfo && (
                               <WeekClassCard data={classInfo} onDelete={handleDeleteClass} />
                           )}
                         </div>
                       );
                     })}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* MONTH VIEW RENDER */}
        {view === 'month' && (
           <div className="flex-1 flex flex-col overflow-auto">
             <div className="grid grid-cols-7 border-b border-gray-100">
               {weekDays.map(day => <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 bg-slate-50">{day.slice(0, 3)}</div>)}
             </div>
            
             <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-gray-50 gap-px border-b border-gray-200">
               {monthDays.map((dayNum, index) => {
                 let todaysClasses = [];
                 let isToday = false;
                 
                 if (dayNum) {
                   // Calculate which Day of the Week this specific date falls on
                   const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                   const dayName = weekDays[dateObj.getDay()]; // e.g. "Monday"
                   
                   // Find recurring classes for "Monday"
                   todaysClasses = schedule.filter(s => s.day === dayName);
                   
                   // Check if it is literally today
                   const today = new Date();
                   if (dayNum === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
                      isToday = true;
                   }
                 }
                 
                 return <MonthDayCell key={index} dayNumber={dayNum} classes={todaysClasses} isToday={isToday} />;
               })}
             </div>
           </div>
        )}
      </div>

      <AddClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddClass} loading={actionLoading} />
    </div>
  );
}