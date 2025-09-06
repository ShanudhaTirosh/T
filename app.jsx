import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, User, Settings, Download, Plus, Trash2, Edit3 } from 'lucide-react';

const SchoolTimetableManager = () => {
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Mathematics', color: '#3B82F6' },
    { id: 2, name: 'Science', color: '#10B981' },
    { id: 3, name: 'English', color: '#F59E0B' },
    { id: 4, name: 'History', color: '#8B5CF6' },
    { id: 5, name: 'ICT', color: '#EF4444' }
  ]);

  const [timetable, setTimetable] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newSubject, setNewSubject] = useState('');
  const [homework, setHomework] = useState([
    { id: 1, subject: 'Mathematics', task: 'Complete Chapter 5 exercises', dueDate: '2025-09-08', status: 'pending' },
    { id: 2, subject: 'Science', task: 'Lab report on photosynthesis', dueDate: '2025-09-10', status: 'pending' },
    { id: 3, subject: 'English', task: 'Essay on Shakespeare', dueDate: '2025-09-07', status: 'completed' }
  ]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  // Auto-generate timetable when subjects change
  useEffect(() => {
    generateTimetable();
  }, [subjects]);

  const generateTimetable = () => {
    const newTimetable = {};
    let subjectIndex = 0;
    
    days.forEach(day => {
      newTimetable[day] = {};
      timeSlots.forEach(time => {
        if (time !== '12:00 PM') { // Skip lunch break
          if (subjects.length > 0) {
            newTimetable[day][time] = subjects[subjectIndex % subjects.length];
            subjectIndex++;
          }
        } else {
          newTimetable[day][time] = { id: 'lunch', name: 'Lunch Break', color: '#6B7280' };
        }
      });
    });
    
    setTimetable(newTimetable);
  };

  const addSubject = () => {
    if (newSubject.trim()) {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16'];
      const newId = Math.max(...subjects.map(s => s.id), 0) + 1;
      setSubjects([...subjects, {
        id: newId,
        name: newSubject.trim(),
        color: colors[subjects.length % colors.length]
      }]);
      setNewSubject('');
    }
  };

  const removeSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const exportToICS = () => {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//School Timetable Manager//EN
CALNAME:My School Timetable
`;

    days.forEach(day => {
      Object.entries(timetable[day] || {}).forEach(([time, subject]) => {
        if (subject.id !== 'lunch') {
          const startTime = convertTo24Hour(time);
          const endTime = convertTo24Hour(getNextTimeSlot(time));
          const date = getNextDateForDay(day);
          
          icsContent += `BEGIN:VEVENT
UID:${subject.id}-${day}-${time}@timetable.com
DTSTART:${date}T${startTime}00
DTEND:${date}T${endTime}00
SUMMARY:${subject.name}
DESCRIPTION:School class: ${subject.name}
RRULE:FREQ=WEEKLY;BYDAY=${getDayAbbr(day)}
END:VEVENT
`;
        }
      });
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'school-timetable.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours.padStart(2, '0')}${minutes}`;
  };

  const getNextTimeSlot = (currentTime) => {
    const currentIndex = timeSlots.indexOf(currentTime);
    return timeSlots[currentIndex + 1] || '5:00 PM';
  };

  const getNextDateForDay = (dayName) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const targetDay = daysOfWeek.indexOf(dayName);
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0].replace(/-/g, '');
  };

  const getDayAbbr = (day) => {
    const abbrs = { Monday: 'MO', Tuesday: 'TU', Wednesday: 'WE', Thursday: 'TH', Friday: 'FR' };
    return abbrs[day];
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Subjects</p>
              <p className="text-3xl font-bold">{subjects.length}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Pending Homework</p>
              <p className="text-3xl font-bold">{homework.filter(h => h.status === 'pending').length}</p>
            </div>
            <Clock className="w-12 h-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Today's Classes</p>
              <p className="text-3xl font-bold">{timeSlots.length - 1}</p>
            </div>
            <Calendar className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Upcoming Homework</h3>
        <div className="space-y-3">
          {homework.filter(h => h.status === 'pending').map(hw => (
            <div key={hw.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{hw.task}</p>
                <p className="text-sm text-gray-600">{hw.subject} • Due: {new Date(hw.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                Pending
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTimetable = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Weekly Timetable</h2>
        <button
          onClick={exportToICS}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export to Calendar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left font-semibold text-gray-700 min-w-[120px]">Time</th>
                {days.map(day => (
                  <th key={day} className="p-4 text-center font-semibold text-gray-700 min-w-[150px]">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time} className="border-t">
                  <td className="p-4 font-medium text-gray-600 bg-gray-50">{time}</td>
                  {days.map(day => {
                    const subject = timetable[day]?.[time];
                    return (
                      <td key={`${day}-${time}`} className="p-2">
                        {subject && (
                          <div
                            className="p-3 rounded-lg text-white text-sm font-medium text-center"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.name}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSubjects = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Subjects</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Add new subject..."
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSubject()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={addSubject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <div
              key={subject.id}
              className="p-4 rounded-lg border-l-4 bg-gray-50 flex items-center justify-between"
              style={{ borderLeftColor: subject.color }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: subject.color }}
                ></div>
                <span className="font-medium">{subject.name}</span>
              </div>
              <button
                onClick={() => removeSubject(subject.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-white shadow-lg z-10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Timetable Manager</h1>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Calendar },
              { id: 'timetable', label: 'Timetable', icon: Clock },
              { id: 'subjects', label: 'Subjects', icon: BookOpen },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-sm">
            <p className="font-medium">Student Dashboard</p>
            <p className="text-blue-100">Grade 10 • Science Stream</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'timetable' && renderTimetable()}
        {activeTab === 'subjects' && renderSubjects()}
        {activeTab === 'profile' && (
          <div className="text-center py-20">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">Profile Page</h3>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-20">
            <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">Settings</h3>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolTimetableManager;