import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Clock, MapPin, AlertCircle, Calendar, Loader2, Search 
} from 'lucide-react';

// ... (Keep CountdownBox and ExamCard components as they are) ...
const CountdownBox = ({ value, label }) => (
  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 text-center min-w-[80px] md:min-w-[100px]">
    <div className="text-2xl md:text-4xl font-bold text-white mb-1">{String(value).padStart(2, '0')}</div>
    <div className="text-xs text-blue-100 uppercase tracking-wider">{label}</div>
  </div>
);

const ExamCard = ({ title, code, type, date, time, duration, location, status }) => {
    // ... (Keep existing ExamCard code) ...
    const isUrgent = status === 'urgent';
    return (
        <div className={`relative ml-8 p-6 rounded-2xl border ${isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'} shadow-sm mb-6`}>
             {/* ... (Rest of JSX) ... */}
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <p className="text-slate-500 text-sm mb-4">{code}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />{date}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />{time}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{location}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ExamSchedulePage() {
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [rollNo, setRollNo] = useState(''); // Default from your request
  const [error, setError] = useState('');
  
  // Timer State (Mock for now, can be updated based on fetched exam date)
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 11, minutes: 31, seconds: 37 });

  const fetchSchedule = async () => {
    if(!rollNo) return;
    setLoading(true);
    setError('');
    
    try {
      // Call our new backend route
      const res = await axios.get(`https://studenthub-gamma.vercel.app/api/exam/schedule?rollNo=${rollNo}`);
      setExams(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch schedule. Please check the roll number.');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch automatically on mount for the specific roll number
  useEffect(() => {
    fetchSchedule();
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Exam Schedule</h1>
        <p className="text-slate-500 mt-1">Real-time schedule from University Portal</p>
      </header>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex gap-4">
        <input 
          type="text" 
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          placeholder="Enter Roll Number (e.g., 2301MC21)"
          className="flex-1 p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
        />
        <button 
          onClick={fetchSchedule}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Fetch
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
        </div>
      )}

      {/* Hero Card: Next Exam (Dynamic) */}
      {exams.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-lg shadow-blue-200 mb-10 relative overflow-hidden">
          {/* ... (Keep existing decorative background) ... */}
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-xs font-bold text-blue-200 tracking-wider uppercase mb-1 block">Next Exam</span>
                <h2 className="text-3xl font-bold">{exams[0].title}</h2>
                <div className="flex items-center gap-2 text-blue-100 mt-1">
                  <span>{exams[0].code}</span>
                  <span>•</span>
                  <span>{exams[0].shift}</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium border border-white/10">
                {exams[0].room}
              </div>
            </div>
            
            {/* Countdown (Static for demo, needs date parsing logic to be dynamic) */}
            <div className="flex justify-center gap-4 mb-8">
               <CountdownBox value={timeLeft.days} label="Days" />
               <CountdownBox value={timeLeft.hours} label="Hours" />
               <CountdownBox value={timeLeft.minutes} label="Minutes" />
            </div>
          </div>
        </div>
      )}

      {/* Timeline List */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Upcoming Exams</h2>
        {exams.length === 0 && !loading && !error && (
            <div className="text-slate-500 italic">No exams found or search not initiated.</div>
        )}
        
        <div className="relative ml-4">
          <div className="absolute left-0 top-4 bottom-0 w-0.5 bg-slate-200"></div>
          
          {exams.map((exam, idx) => (
            <ExamCard 
              key={idx}
              title={exam.title}
              code={exam.code}
              type={exam.shift} // Using shift as type
              date={`${exam.day}, ${exam.date}`}
              time={exam.shift}
              duration="3 hours" // Default or parse from shift
              location={exam.room}
              status={idx === 0 ? 'urgent' : 'normal'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}