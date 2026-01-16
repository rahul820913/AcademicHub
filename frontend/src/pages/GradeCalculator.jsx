import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Calculator, ChevronDown, TrendingUp, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- Helper Components ---

const ScoreInput = ({ label, max, value, onChange, placeholder, disabled }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <span className="text-xs text-slate-400">out of {max}</span>
    </div>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full p-3 rounded-xl border border-gray-200 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
    />
  </div>
);

const RequirementRow = ({ grade, points, needed, finalMax }) => {
  let statusText = "";
  let statusColor = "";

  if (needed <= 0) {
    statusText = "Secured";
    statusColor = "text-green-600 font-bold";
  } else if (needed > finalMax) {
    statusText = "Impossible";
    statusColor = "text-red-500 font-bold";
  } else {
    statusText = `Need ${needed} in final`;
    statusColor = "text-slate-600 font-medium";
  }

  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700">
          {grade}
        </div>
        <span className="text-sm text-slate-500">{points}+ points</span>
      </div>
      <span className={`text-sm ${statusColor}`}>{statusText}</span>
    </div>
  );
};

export default function GradeCalculatorPage() {
  const { currentUser } = useAuth();
  
  // State
  const [selectedCourse, setSelectedCourse] = useState('CS201'); // Default Course Code
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState({
    quiz1: '',
    midterm: '',
    quiz2: '',
    final: '' 
  });

  // Constants
  const MAX_SCORES = { quiz1: 10, midterm: 30, quiz2: 10, final: 50 };
  
  // Grade Thresholds
  const GRADES = [
    { label: 'A+', min: 90 }, { label: 'A', min: 85 }, { label: 'B+', min: 80 },
    { label: 'B', min: 75 }, { label: 'C+', min: 70 }, { label: 'C', min: 65 }, { label: 'D', min: 60 },
  ];

  // 1. Fetch Scores on Course Change
  useEffect(() => {
    const fetchScores = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const res = await axios.get(`https://studenthub-gamma.vercel.app/api/grades/${selectedCourse}`, {
            headers: { 'user-id': currentUser.id }
        });
        
        // Merge fetched scores with defaults (handle nulls as empty strings)
        setScores({
            quiz1: res.data.quiz1 || '',
            midterm: res.data.midterm || '',
            quiz2: res.data.quiz2 || '',
            final: res.data.final || ''
        });
      } catch (err) {
        console.error("Failed to load scores", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [selectedCourse, currentUser]);

  // 2. Save Logic (Debounced)
  const saveTimeoutRef = useRef(null);

  const saveScore = async (field, value) => {
    if (!currentUser) return;
    try {
        await axios.post('https://studenthub-gamma.vercel.app/api/grades/save', {
            courseCode: selectedCourse,
            assessmentType: field,
            score: value,
            maxScore: MAX_SCORES[field]
        }, { headers: { 'user-id': currentUser.id } });
    } catch (err) {
        console.error("Save failed", err);
    }
  };

  const handleScoreChange = (field, value) => {
    // Validation
    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= MAX_SCORES[field])) {
      
      // Update UI Immediately
      setScores(prev => ({ ...prev, [field]: value }));

      // Debounce Save (Wait 500ms after typing stops to save)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(() => {
        saveScore(field, value);
      }, 500);
    }
  };

  // Calculations
  const currentTotal = 
    (parseFloat(scores.quiz1) || 0) + 
    (parseFloat(scores.midterm) || 0) + 
    (parseFloat(scores.quiz2) || 0);
  
  const finalScore = parseFloat(scores.final) || 0;
  const projectedTotal = currentTotal + finalScore;

  const getCurrentGrade = (total) => {
    if (total >= 90) return 'A+';
    if (total >= 85) return 'A';
    if (total >= 80) return 'B+';
    if (total >= 75) return 'B';
    if (total >= 70) return 'C+';
    if (total >= 65) return 'C';
    if (total >= 60) return 'D';
    return 'F';
  };

  const currentGrade = getCurrentGrade(projectedTotal);

  // Prediction Logic
  const targetGrade = 85;
  const neededForA = targetGrade - currentTotal;
  const isTargetAchievable = neededForA <= MAX_SCORES.final;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Grade Calculator</h1>
        <p className="text-slate-500 mt-1">Calculate and predict your final grades</p>
      </header>

      {/* Course Selector */}
      <div className="mb-8 max-w-md">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Course</label>
        <div className="relative">
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 text-slate-800 text-sm rounded-xl p-3 pr-8 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-sm cursor-pointer"
          >
            <option value="CS201">Data Structures (CS201)</option>
            <option value="MATH202">Calculus II (MATH202)</option>
            <option value="CS202">Database Systems (CS202)</option>
          </select>
          <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">Enter Your Scores</h2>
              </div>

              <div className="space-y-2">
                <ScoreInput label="Quiz 1" max={MAX_SCORES.quiz1} value={scores.quiz1} onChange={(v) => handleScoreChange('quiz1', v)} />
                <ScoreInput label="Mid-Term" max={MAX_SCORES.midterm} value={scores.midterm} onChange={(v) => handleScoreChange('midterm', v)} />
                <ScoreInput label="Quiz 2" max={MAX_SCORES.quiz2} value={scores.quiz2} onChange={(v) => handleScoreChange('quiz2', v)} />
                <ScoreInput label="End-Term" max={MAX_SCORES.final} value={scores.final} onChange={(v) => handleScoreChange('final', v)} placeholder="Leave empty to predict" />
              </div>
              
              {/* Breakdown Box (Same as before) */}
              <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Grade Breakdown</h3>
                <div className="space-y-2 text-sm">
                   <div className="flex justify-between"><span className="text-slate-500">Quiz 1:</span><span className="font-medium text-slate-800">10%</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Mid-Term:</span><span className="font-medium text-slate-800">30%</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Quiz 2:</span><span className="font-medium text-slate-800">10%</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">End-Term:</span><span className="font-medium text-slate-800">50%</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Prediction */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Current Progress Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
               {/* Same UI code for the Blue Card */}
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-2 text-blue-100">
                   <TrendingUp className="w-5 h-5" />
                   <span className="font-medium">Current Progress</span>
                 </div>
                 <div className="flex items-baseline gap-2 mb-1">
                   <span className="text-5xl font-bold">{projectedTotal.toFixed(1)}</span>
                   <span className="text-xl text-blue-200">/ 100</span>
                 </div>
                 <div className="text-sm text-blue-100 mb-6">Total Score</div>
                 
                 <div className="w-full bg-black/20 rounded-full h-3 mb-6">
                   <div className="bg-white rounded-full h-3 transition-all duration-500 ease-out" style={{ width: `${Math.min(projectedTotal, 100)}%` }}></div>
                 </div>

                 <div className="flex justify-between items-end">
                   <span className="text-blue-100">Grade:</span>
                   <span className="text-3xl font-bold">{currentGrade}</span>
                 </div>
               </div>
               <div className="absolute -top-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>

            {/* Prediction Card */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
              <h3 className="font-bold text-green-800 mb-4">Grade Prediction</h3>
              <div className="bg-white rounded-xl p-5 border border-green-100 shadow-sm">
                <div className="text-sm font-semibold text-green-600 mb-1">Target Grade: A (85+)</div>
                <div className="text-xl font-bold text-slate-800">
                  {isTargetAchievable ? (
                    <>You need <span className="text-slate-900">{Math.max(0, neededForA)}/{MAX_SCORES.final}</span></>
                  ) : (
                    <span className="text-red-500">Target Unreachable</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {isTargetAchievable ? "in End-Term to secure an A" : `Max possible: ${(currentTotal + MAX_SCORES.final)}`}
                </p>
              </div>
            </div>

            {/* Requirements List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-slate-800 mb-4">Score Requirements</h3>
              <div className="space-y-3">
                {GRADES.map((grade) => (
                  <RequirementRow 
                    key={grade.label}
                    grade={grade.label}
                    points={grade.min}
                    needed={grade.min - currentTotal}
                    finalMax={MAX_SCORES.final}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}