import React from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  LineChart as LineIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- Mock Data for Charts ---
const attendanceTrendData = [
  { name: 'Aug', attendance: 78 },
  { name: 'Sep', attendance: 82 },
  { name: 'Oct', attendance: 75 }, 
  { name: 'Nov', attendance: 85 },
  { name: 'Dec', attendance: 88 },
  { name: 'Jan', attendance: 85 },
];

const coursePerformanceData = [
  { name: 'Data Structures', score: 82 },
  { name: 'Physics', score: 65 },
  { name: 'Database', score: 88 },
  { name: 'OS', score: 72 }, 
];

const studyHoursData = [
  { name: 'Mon', hours: 4.5 },
  { name: 'Tue', hours: 6 },
  { name: 'Wed', hours: 3.5 },
  { name: 'Thu', hours: 5 },
  { name: 'Fri', hours: 4 },
  { name: 'Sat', hours: 7 }, 
  { name: 'Sun', hours: 5.5 },
];

const pieData = [
  { name: 'Present', value: 83, color: '#22c55e' }, 
  { name: 'Late', value: 4, color: '#f59e0b' },    
  { name: 'Absent', value: 13, color: '#ef4444' },  
];

// --- Sub-components ---

const StatCard = ({ icon: Icon, label, value, trend, trendUp, color }) => {
  const colorStyles = {
    blue: { icon: 'bg-blue-100 text-blue-600', text: 'text-blue-600' },
    purple: { icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
    green: { icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
    orange: { icon: 'bg-orange-100 text-orange-600', text: 'text-orange-600' },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${colorStyles[color].icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {trend}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
};

const InsightCard = ({ icon: Icon, title, desc, color }) => {
  const styles = {
    green: "bg-green-50 border-green-100 text-green-800 icon-green-600",
    blue: "bg-blue-50 border-blue-100 text-blue-800 icon-blue-600",
    orange: "bg-orange-50 border-orange-100 text-orange-800 icon-orange-600",
    purple: "bg-purple-50 border-purple-100 text-purple-800 icon-purple-600",
  };

  // Determine icon color class manually since we need to split it
  const iconColor = styles[color].split(' ').find(c => c.startsWith('icon-')).replace('icon-', 'text-');

  return (
    <div className={`p-5 rounded-xl border ${styles[color]} flex items-start gap-4`}>
      <div className={`p-2 rounded-lg bg-white/60 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <p className="text-xs opacity-90 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function AnalyticsPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 mt-1">Track your academic progress and performance</p>
      </header>

      {/* 1. Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={Target} 
          label="Overall Attendance" 
          value="83%" 
          trend="+5%" 
          trendUp={true} 
          color="blue" 
        />
        <StatCard 
          icon={Award} 
          label="Average Score" 
          value="78" 
          trend="+3%" 
          trendUp={true} 
          color="purple" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Courses Above 75%" 
          value="4" 
          trend="+2" 
          trendUp={true} 
          color="green" 
        />
        <StatCard 
          icon={TrendingDown} 
          label="Courses Below 75%" 
          value="2" 
          trend="-1" 
          trendUp={false} 
          color="orange" 
        />
      </div>

      {/* 2. Charts Row 1 (Trend & Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Attendance Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Attendance Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-2 text-xs font-medium text-blue-500 items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-blue-500"></div> attendance
          </div>
        </div>

        {/* Course Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Course Performance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformanceData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-2 text-xs font-medium text-purple-500 items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-purple-500"></div> score
          </div>
        </div>
      </div>

      {/* 3. Charts Row 2 (Distribution & Hours) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Attendance Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Attendance Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Study Hours */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Study Hours</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyHoursData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 8]} />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-2 text-xs font-medium text-cyan-500 items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-cyan-500"></div> hours
          </div>
        </div>
      </div>

      {/* 4. Key Insights Grid */}
      <h3 className="text-lg font-bold text-slate-800 mb-4">Key Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard 
          icon={TrendingUp}
          title="Attendance Improving"
          desc="Your attendance has improved by 5% this month. Keep up the good work!"
          color="green"
        />
        <InsightCard 
          icon={Award}
          title="Best Performance"
          desc="Database Systems is your top-performing course with 91% attendance."
          color="blue"
        />
        <InsightCard 
          icon={Target} 
          title="Need Attention"
          desc="Calculus II needs more focus. Consider attending office hours."
          color="orange"
        />
        <InsightCard 
          icon={LineIcon}
          title="Study Pattern"
          desc="You study most on Saturdays. Try to distribute study time more evenly."
          color="purple"
        />
      </div>
    </div>
  );
}