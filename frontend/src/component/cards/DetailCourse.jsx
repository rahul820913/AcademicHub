import React from 'react';
import { User, Clock, MapPin } from 'lucide-react';

// --- 1. Circular Progress Component ---
const CircularProgress = ({ percentage, color }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const safePercent = isNaN(percentage) ? 0 : percentage;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background Circle */}
        <circle cx="40" cy="40" r={radius} stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
        
        {/* Progress Circle */}
        <circle 
          cx="40" cy="40" r={radius} 
          stroke="currentColor" strokeWidth="6" fill="transparent" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          // If color is 'red', use red-500, otherwise blue-600
          className={color === 'red' ? 'text-red-500' : 'text-blue-600'} 
        />
      </svg>
      {/* Percentage Text */}
      <span className={`absolute text-sm font-bold ${color === 'red' ? 'text-red-600' : 'text-slate-800'}`}>
        {safePercent}%
      </span>
    </div>
  );
};

// --- 2. Detailed Course Card Component ---
const DetailedCourseCard = ({ 
  title, 
  code, 
  instructor, 
  time, 
  location, 
  classesPerWeek, 
  totalConducted, 
  totalAttended, 
  color, 
  onViewDetails 
}) => {
  
  // A. Calculate Percentage
  const percentage = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 0;
  
  // B. Risk Logic: If < 75% and classes have started
  const isRisk = percentage < 75 && totalConducted > 0;
  
  // C. Determine Display Color (Force 'red' if risk, else use prop or default blue)
  const displayColor = isRisk ? 'red' : (color || 'blue');

  return (
    <div className={`
      bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow
      ${isRisk ? 'border-red-200 bg-red-50/20' : 'border-gray-100'}
    `}>
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-slate-500 text-sm mt-1">{code} • {classesPerWeek} Sessions/Week</p>
          
          {/* Risk Badge (Red) */}
          {isRisk && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded">
              Attendance Risk
            </span>
          )}
        </div>
        
        {/* Progress Ring */}
        <CircularProgress percentage={percentage} color={displayColor} />
      </div>

      {/* Details Section */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-slate-600">
             <User className="w-4 h-4 mr-3 text-slate-400" />
             {instructor || "Faculty"}
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <Clock className="w-4 h-4 mr-3 text-slate-400" />
          <span className="truncate max-w-[250px]">{time}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <MapPin className="w-4 h-4 mr-3 text-slate-400" />
          {location}
        </div>
      </div>

      {/* Grid Stats Footer */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-50 mb-4">
        <div className="text-center border-r border-gray-50 last:border-0">
          <div className="text-xs text-slate-500 mb-1">Weekly</div>
          <div className="font-bold text-slate-800">{classesPerWeek}</div>
        </div>
        <div className="text-center border-r border-gray-50 last:border-0">
          <div className="text-xs text-slate-500 mb-1">Attended</div>
          {/* Highlight in Red if Risk, Green if Safe */}
          <div className={`font-bold ${isRisk ? 'text-red-600' : 'text-green-600'}`}>
            {totalAttended}/{totalConducted}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-1">Projected</div>
          <div className="font-bold text-slate-800">{classesPerWeek * 14}</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between mt-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          {code.split(' ')[0] || 'General'}
        </span>
        <button 
          onClick={onViewDetails}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};

export default DetailedCourseCard;