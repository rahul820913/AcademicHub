import React, { useState } from 'react';
import { 
  Bell,
  Globe,
  Shield,
  Database,
  Lock,
  Moon,
  ChevronDown
} from 'lucide-react';

// --- Form Components ---

const Toggle = ({ label, enabled, onChange, icon: Icon }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
    <button 
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <div 
        className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} 
      />
    </button>
  </div>
);

const SelectGroup = ({ label, value, options }) => (
  <div className="mb-4 last:mb-0">
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      <select 
        defaultValue={value}
        className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 pr-8 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, description, colorClass }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`p-2.5 rounded-lg ${colorClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  </div>
);

export default function SettingsPage() {
  const [toggles, setToggles] = useState({
    email: true,
    push: true,
    sms: false,
    classReminders: true,
    examAlerts: true,
    attendance: true,
    grades: true,
    darkMode: false,
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowDMs: true
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and settings</p>
      </header>

      <div className="max-w-3xl space-y-6">

        {/* 1. Notifications Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <SectionHeader 
            icon={Bell} 
            title="Notifications" 
            description="Manage how you receive notifications" 
            colorClass="bg-blue-50 text-blue-600"
          />
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notification Channels</h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <Toggle label="Email Notifications" enabled={toggles.email} onChange={() => handleToggle('email')} icon={null} />
                <Toggle label="Push Notifications" enabled={toggles.push} onChange={() => handleToggle('push')} icon={null} />
                <Toggle label="SMS Notifications" enabled={toggles.sms} onChange={() => handleToggle('sms')} icon={null} />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notification Types</h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <Toggle label="Class Reminders" enabled={toggles.classReminders} onChange={() => handleToggle('classReminders')} />
                <Toggle label="Exam Alerts" enabled={toggles.examAlerts} onChange={() => handleToggle('examAlerts')} />
                <Toggle label="Attendance Warnings" enabled={toggles.attendance} onChange={() => handleToggle('attendance')} />
                <Toggle label="Grade Updates" enabled={toggles.grades} onChange={() => handleToggle('grades')} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Preferences Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <SectionHeader 
            icon={Globe} 
            title="Preferences" 
            description="Customize your experience" 
            colorClass="bg-purple-50 text-purple-600"
          />

          <div className="mb-6">
             <Toggle 
               label="Dark Mode" 
               enabled={toggles.darkMode} 
               onChange={() => handleToggle('darkMode')} 
               icon={Moon} 
             />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <SelectGroup 
              label="Language" 
              value="English" 
              options={['English', 'Spanish', 'French', 'German']} 
            />
            <SelectGroup 
              label="Timezone" 
              value="EST (UTC-5)" 
              options={['EST (UTC-5)', 'PST (UTC-8)', 'GMT (UTC+0)', 'IST (UTC+5:30)']} 
            />
            <SelectGroup 
              label="Date Format" 
              value="MM/DD/YYYY" 
              options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} 
            />
          </div>
        </div>

        {/* 3. Privacy & Security */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <SectionHeader 
            icon={Shield} 
            title="Privacy & Security" 
            description="Control your privacy settings" 
            colorClass="bg-green-50 text-green-600"
          />
          
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
            <Toggle label="Profile Visible to Others" enabled={toggles.profileVisible} onChange={() => handleToggle('profileVisible')} />
            <Toggle label="Show Email Address" enabled={toggles.showEmail} onChange={() => handleToggle('showEmail')} />
            <Toggle label="Show Phone Number" enabled={toggles.showPhone} onChange={() => handleToggle('showPhone')} />
            <Toggle label="Allow Direct Messages" enabled={toggles.allowDMs} onChange={() => handleToggle('allowDMs')} />
          </div>

          <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </button>
        </div>

        {/* 4. Data Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <SectionHeader 
            icon={Database} 
            title="Data Management" 
            description="Manage your data and storage" 
            colorClass="bg-orange-50 text-orange-600"
          />

          <div className="space-y-4">
            <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-slate-50 transition-colors group">
              <h4 className="font-semibold text-slate-800 text-sm">Download My Data</h4>
              <p className="text-xs text-slate-500">Get a copy of all your academic data</p>
            </button>

            <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-slate-50 transition-colors group">
              <h4 className="font-semibold text-slate-800 text-sm">Clear Cache</h4>
              <p className="text-xs text-slate-500">Free up space by clearing cached data</p>
            </button>

            <button className="w-full text-left p-4 rounded-xl border border-red-200 bg-red-50/30 hover:bg-red-50 transition-colors group">
              <h4 className="font-semibold text-red-600 text-sm">Delete Account</h4>
              <p className="text-xs text-red-400">Permanently delete your account and data</p>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-white border border-gray-200 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors">
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}