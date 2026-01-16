import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';

const CircularProgress = ({ percentage, color }) => {
    // Reduced size for better fit in a row card
    const radius = 22; 
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const safePercent = isNaN(percentage) ? 0 : percentage;
  
    return (
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
          <circle 
            cx="32" cy="32" r={radius} 
            stroke="currentColor" strokeWidth="5" fill="transparent" 
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            className={color === 'red' ? 'text-orange-500' : 'text-blue-600'} 
          />
        </svg>
        <span className="absolute text-xs font-bold text-slate-800">{safePercent}%</span>
      </div>
    );
};

const CourseCard = ({ title, code, percentage, attended, total, warning, onViewDetails }) => {
  return (
    <div 
      onClick={onViewDetails}
      className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        
        {/* Left Box: Compact Progress Circle */}
        <div className="shrink-0">
            <CircularProgress percentage={percentage} color={warning ? 'red' : 'blue'} />
        </div>

        {/* Middle: Details */}
        <div className="flex flex-col text-left">
          <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors leading-tight">
            {title}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span className="font-medium">{code}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Total: {total}</span>
          </div>

          {/* Status Indicator */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold">
            {warning ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-500">Warning: Below 75%</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">On Track: {attended} Attended</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Action Icon */}
      <div className="pl-4">
        <button className="p-2 text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-full transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;