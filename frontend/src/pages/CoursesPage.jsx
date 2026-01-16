import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Clock, Users, Search, Filter, MapPin, User, Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 
import DetailedCourseCard from '../component/cards/DetailCourse';

// --- Helper Components ---
const SolidStatCard = ({ icon: Icon, label, value, color }) => {
  // Define rich gradients based on the color prop
  const styles = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-200",
    purple: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-200",
    green: "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-200",
    orange: "bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-200",
    slate: "bg-gradient-to-br from-slate-600 to-slate-800 shadow-slate-200",
  };

  // Default to slate if color not found
  const activeStyle = styles[color] || styles.slate;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${activeStyle}`}>
      
      {/* Decorative Big Icon in Background */}
      <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
        <Icon className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Glassy Icon Container */}
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/10 mb-4">
          <Icon className="w-6 h-6 text-white" />
        </div>

        <div>
          <h3 className="text-4xl font-extrabold tracking-tight">{value}</h3>
          <p className="text-sm font-medium text-white/80 mt-1 uppercase tracking-wide">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function CoursesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Data
  useEffect(() => {
    const fetchCoursesFromTimetable = async () => {
      if (!currentUser) return;
      try {
        const res = await axios.get('http://localhost:5000/api/timetable/summary', {
            headers: { 'user-id': currentUser.id }
        });
        
        // Map backend data to frontend props
        const formattedData = res.data.map(c => ({
            ...c,
            classesPerWeek: parseInt(c.classes_per_week || 0),
            totalConducted: parseInt(c.total_conducted || 0),
            totalAttended: parseInt(c.total_attended || 0),
            time: c.time_summary,
            instructor: "Faculty" 
        }));

        setCourses(formattedData);
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesFromTimetable();
  }, [currentUser]);

  // 2. Filter Logic for Search
  const filteredCourses = useMemo(() => {
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  // 3. Stats Calculation (Global Average)
  const stats = useMemo(() => {
    const totalClassesPerWeek = courses.reduce((acc, c) => acc + c.classesPerWeek, 0);
    
    // Calculate global attendance average
    let totalPercents = 0;
    let validCourses = 0;
    
    courses.forEach(c => {
      if(c.totalConducted > 0) {
        totalPercents += (c.totalAttended / c.totalConducted);
        validCourses++;
      }
    });
    
    const avgAttendance = validCourses > 0 
      ? Math.round((totalPercents / validCourses) * 100) 
      : 0;

    return { totalClassesPerWeek, avgAttendance };
  }, [courses]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Courses</h1>
        <p className="text-slate-500 mt-1">Generated automatically from your Timetable</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SolidStatCard 
          icon={BookOpen} 
          value={courses.length} 
          label="Total Subjects" 
          colorClass="bg-blue-600" 
        />
        <SolidStatCard 
          icon={Users} 
          value={stats.totalClassesPerWeek} 
          label="Classes Per Week" 
          colorClass="bg-purple-600" 
        />
        <SolidStatCard 
          icon={Clock} 
          value={`${stats.avgAttendance}%`} 
          label="Avg. Attendance" 
          colorClass={stats.avgAttendance >= 75 ? "bg-green-500" : "bg-orange-500"} 
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search courses by name or code..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-0 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-slate-600">No courses found</h3>
            <p className="text-slate-400 text-sm mt-1">
              {searchTerm ? "Try a different search term." : "Add classes to your Timetable to see them here."}
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
            <DetailedCourseCard 
                key={course.id}
                {...course}
                onViewDetails={() => navigate(`/attendance/${course.code}`)}
            />
            ))}
        </div>
      )}
    </div>
  );
}