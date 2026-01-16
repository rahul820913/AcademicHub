import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mail, Phone, Calendar, Droplet, MapPin, GraduationCap, 
  Camera, Pencil, Award, Trophy, Medal, Star, Save, X, Loader2, Plus, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

// --- Sub-Components ---

const InfoItem = ({ icon: Icon, label, value, iconColor, isEditing, name, onChange, type = "text" }) => (
  <div className="flex items-start gap-4">
    <div className={`p-2.5 rounded-lg shrink-0 ${iconColor}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="w-full">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      {isEditing ? (
        <input 
          type={type} 
          name={name}
          value={value || ''} 
          onChange={onChange}
          className="w-full p-1 border border-blue-200 rounded text-sm focus:outline-blue-500"
        />
      ) : (
        <p className="text-sm font-semibold text-slate-800 break-words">{value || "Not Set"}</p>
      )}
    </div>
  </div>
);

// FIX: Updated to accept an 'item' object and 'onDelete' function
const HistoryItem = ({ item, onDelete }) => (
  <div className="group relative flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-100 hover:bg-slate-50/50 transition-colors">
    <div className="w-1/3">
      <h4 className="font-bold text-slate-800 text-sm">{item.term}</h4>
      <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'Current' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
        {item.status}
      </span>
    </div>
    <div className="text-center w-1/3">
      <div className="text-xs text-slate-400 mb-1">GPA</div>
      <div className="font-bold text-blue-600 text-lg">{item.gpa}</div>
    </div>
    <div className="text-right w-1/3">
      <div className="text-xs text-slate-400 mb-1">Credits</div>
      <div className="font-bold text-slate-800">{item.credits}</div>
    </div>
    
    {/* Delete Button (Visible on Hover) */}
    <button 
      onClick={() => onDelete(item.id)}
      className="absolute -top-2 -right-2 bg-white border border-red-100 text-red-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
);

const AwardCard = ({ iconType, title, subtext }) => {
  const icons = { award: Award, trophy: Trophy, medal: Medal, star: Star };
  const Icon = icons[iconType] || Award;
  
  return (
    <div className="flex items-center gap-4 p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl">
      <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
        <p className="text-xs text-slate-500">{subtext}</p>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Data State
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({});
  
  // FIX: History is an ARRAY of items
  const [history, setHistory] = useState([]); 
  const [achievements, setAchievements] = useState([]);

  // Edit State
  const [formData, setFormData] = useState({});
  const [isAddingHistory, setIsAddingHistory] = useState(false);
  
  // FIX: New state to handle the input form for new history item
  const [newHistory, setNewHistory] = useState({ term: '', status: 'Completed', gpa: '', credits: '' });

  // Fetch Data
  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const fetchProfile = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get('https://studenthub-gamma.vercel.app/api/profile', {
        headers: { 'user-id': currentUser.id }
      });
      console.log(res.data);
      setProfile(res.data.user);
      setFormData(res.data.user); 
      setStats(res.data.stats);
      // Ensure history is an array (fallback to empty array if null)
      setHistory(Array.isArray(res.data.history) ? res.data.history : []);
      setAchievements(res.data.achievements || []);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Change for Profile
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // FIX: Add History Logic
  const addHistory = () => {
    if(!newHistory.term) return;
    // Add to local state (In a real app, you'd likely POST to backend here too)
    const newItem = { ...newHistory, id: Date.now() }; // Generate temp ID
    setHistory([newItem, ...history]); // Add to top of list
    
    setNewHistory({ term: '', status: 'Completed', gpa: '', credits: '' }); // Reset form
    setIsAddingHistory(false); // Close form
  };

  // FIX: Delete History Logic
  const deleteHistory = (id) => {
    setHistory(history.filter(item => item.id !== id));
  };

  // Save Changes (Profile Info Only)
  const handleSave = async () => {
    try {
      await axios.put('https://studenthub-gamma.vercel.app/api/profile/update', formData, {
        headers: { 'user-id': currentUser.id }
      });
      setProfile(formData); 
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile. Check date format.");
    }
  };

  const formatDateForInput = (isoDateString) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Profile</h1>
        <p className="text-slate-500 mt-1">Manage your personal information and academic details</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Profile Card & Quick Stats) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-blue-200 uppercase">
                {profile.full_name ? profile.full_name.substring(0, 2) : 'ST'}
              </div>
              <button className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors border-2 border-white">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{profile.full_name}</h2>
            <p className="text-slate-500 text-sm">{profile.email}</p>
            <div className="w-full mt-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Current CGPA</p>
              <div className="text-4xl font-bold text-blue-600">8.22</div>

            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="text-xs text-slate-500">Department</span>
                <span className="text-sm font-bold text-slate-800 text-right">{stats.department || 'N/A'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="text-xs text-slate-500">Semester</span>
                <span className="text-sm font-bold text-slate-800">{stats.semester}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span className="text-xs text-slate-500">Enrolled</span>
                <span className="text-sm font-bold text-slate-800">
                  {stats.enrolled ? new Date(stats.enrolled).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Info, History, Awards) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Personal Information */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
              {isEditing ? (
                <div className="flex gap-2">
                   <button onClick={() => setIsEditing(false)} className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"><X className="w-4 h-4" /></button>
                   <button onClick={handleSave} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100"><Save className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <InfoItem icon={Mail} label="Email Address" value={profile.email} iconColor="bg-blue-50 text-blue-600" />
              <InfoItem icon={Phone} label="Phone Number" name="phone" value={isEditing ? formData.phone : profile.phone} onChange={handleChange} isEditing={isEditing} iconColor="bg-green-50 text-green-600" />
              <InfoItem icon={Calendar} label="Date of Birth" name="dob" type="date" value={isEditing ? formatDateForInput(formData.dob) : (profile.dob ? new Date(profile.dob).toLocaleDateString() : '')} onChange={handleChange} isEditing={isEditing} iconColor="bg-purple-50 text-purple-600" />
              <InfoItem icon={Droplet} label="Blood Group" name="blood_group" value={isEditing ? formData.blood_group : profile.blood_group} onChange={handleChange} isEditing={isEditing} iconColor="bg-red-50 text-red-500" />
              <InfoItem icon={MapPin} label="Address" name="address" value={isEditing ? formData.address : profile.address} onChange={handleChange} isEditing={isEditing} iconColor="bg-orange-50 text-orange-500" />
              <InfoItem icon={GraduationCap} label="Major" name="major" value={isEditing ? formData.major : profile.major} onChange={handleChange} isEditing={isEditing} iconColor="bg-cyan-50 text-cyan-600" />
            </div>
          </div>

          {/* Academic History */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Academic History</h3>
                <button onClick={() => setIsAddingHistory(true)} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100">
                  <Plus className="w-3 h-3" /> Add
                </button>
            </div>

            {/* Add History Form */}
            {isAddingHistory && (
              <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input 
                    type="text" 
                    placeholder="Term (e.g. Fall 2025)" 
                    className="p-2 rounded border" 
                    value={newHistory.term} 
                    onChange={e => setNewHistory({...newHistory, term: e.target.value})} 
                  />
                  <select 
                    className="p-2 rounded border" 
                    value={newHistory.status} 
                    onChange={e => setNewHistory({...newHistory, status: e.target.value})}
                  >
                    <option>Completed</option>
                    <option>Current</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="GPA" 
                    className="p-2 rounded border" 
                    value={newHistory.gpa} 
                    onChange={e => setNewHistory({...newHistory, gpa: e.target.value})} 
                  />
                  <input 
                    type="text" 
                    placeholder="Credits" 
                    className="p-2 rounded border" 
                    value={newHistory.credits} 
                    onChange={e => setNewHistory({...newHistory, credits: e.target.value})} 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsAddingHistory(false)} className="text-slate-500 text-sm px-3">Cancel</button>
                  <button onClick={addHistory} className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg">Save</button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* FIX: Ensure history is an array before mapping */}
              {Array.isArray(history) && history.map((item) => (
                <HistoryItem key={item.id} item={item} onDelete={deleteHistory} />
              ))}
              {(!history || history.length === 0) && <div className="text-center text-slate-400 py-4 text-sm">No records added yet.</div>}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Achievements & Awards</h3>
                {achievements.length === 0 && <span className="text-xs text-slate-400">No awards yet</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((item) => (
                <AwardCard 
                  key={item.id}
                  iconType={item.icon_type} 
                  title={item.title} 
                  subtext={item.subtext} 
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}