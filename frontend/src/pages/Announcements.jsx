import React from 'react';
import { Calendar, Bell, HelpCircle } from 'lucide-react';

// Announcement Card Component
const AnnouncementCard = ({ type, date, title, poster, time, content }) => {
  const isUrgent = type === 'urgent';
  const tagColor = isUrgent ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  const Icon = isUrgent ? Bell : Calendar;
  const tagName = isUrgent ? 'Urgent' : 'Schedule';

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${tagColor}`}>
          <Icon size={14} />
          {tagName}
        </span>
        {!isUrgent && <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14}/> {date}</span>}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">Posted by {poster} • {date}, {time}</p>
      <p className="text-gray-700">{content}</p>
    </div>
  );
};

// Main Page Component
const AnnouncementsPage = () => {
  const announcements = [
    {
      id: 1,
      type: 'schedule',
      date: 'Jan 15, 2026',
      title: 'Database Lab Cancelled - Jan 15',
      poster: 'Class Representative',
      time: '2:30 PM',
      content: 'The Database Management lab scheduled for January 15th has been cancelled due to a technical issue with the lab equipment. We will reschedule it next week.'
    },
    {
      id: 2,
      type: 'urgent',
      date: 'Jan 8',
      title: 'Upcoming Mid-term Exams',
      poster: 'Class Representative',
      time: '10:00 AM',
      content: 'Mid-term examinations will be held from January 20-25. Please prepare accordingly. The exam schedule will be shared by tomorrow.'
    },
  ];

  return (
    <div className="relative">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
            <p className="text-gray-500">Stay updated with class schedule changes and important notices</p>
          </div>
          <div className="space-y-4">
            {announcements.map(announcement => (
              <AnnouncementCard key={announcement.id} {...announcement} />
            ))}
          </div>
        </div>
        
      <button className="fixed bottom-8 right-8 bg-gray-900 hover:bg-black text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 z-50">
        <HelpCircle size={24} />
      </button>
    </div>
  );
};

export default AnnouncementsPage;