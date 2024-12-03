'use client';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/FirebaseConfig';
import { collection, query, where, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

const COLORS = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Orange', value: 'bg-orange-500' },
];

const EventModal = ({ onClose, onSave, selectedDate }) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    color: COLORS[0].value
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(eventData);
    setEventData({ title: '', description: '', color: COLORS[0].value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">New Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              placeholder="Enter event title..."
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 resize-none h-24"
              placeholder="Enter event description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setEventData({ ...eventData, color: color.value })}
                  className={`w-8 h-8 rounded-full ${color.value} transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    eventData.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!eventData.title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CalendarView = () => {
  const [value, setValue] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const q = query(
        collection(db, 'events'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedEvents = {};
      querySnapshot.docs.forEach(doc => {
        const event = doc.data();
        const dateKey = event.date.split('T')[0];
        if (!fetchedEvents[dateKey]) {
          fetchedEvents[dateKey] = [];
        }
        fetchedEvents[dateKey].push({
          id: doc.id,
          ...event
        });
      });
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = async (eventData) => {
    if (!eventData.title.trim()) return;

    try {
      await addDoc(collection(db, 'events'), {
        userId: user.uid,
        title: eventData.title,
        description: eventData.description,
        color: eventData.color,
        date: selectedDate.toISOString(),
        createdAt: new Date().toISOString()
      });
      await fetchEvents();
      setShowEventModal(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleDateClick = (date) => {
    setValue(date);
    setSelectedDate(date);
  };

  const tileContent = ({ date }) => {
    const dateKey = date.toISOString().split('T')[0];
    const dateEvents = events[dateKey] || [];

    if (dateEvents.length > 0) {
      return (
        <div className="absolute inset-x-0 bottom-1 flex justify-center gap-0.5">
          {dateEvents.slice(0, 3).map((event, index) => (
            <div
              key={event.id}
              className={`h-1 w-1 rounded-full ${event.color || 'bg-blue-500'}`}
            />
          ))}
          {dateEvents.length > 3 && (
            <div className="h-1 w-1 rounded-full bg-gray-300" />
          )}
        </div>
      );
    }
    return null;
  };

  if (!isClient) {
    return (
      <div className="animate-pulse">
        <div className="h-[300px] bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  const dateEvents = events[value.toISOString().split('T')[0]] || [];

  return (
    <div className="space-y-4">
      <style jsx global>{`
        .react-calendar__tile {
          position: relative;
          height: 44px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          padding-top: 12px;
        }
        .react-calendar__month-view__days__day {
          padding: 8px 0 !important;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #f3f4f6 !important;
        }
        .react-calendar__tile--active {
          background-color: #eff6ff !important;
          color: #2563eb !important;
        }
        .react-calendar__tile--now {
          background-color: transparent !important;
        }
        .react-calendar__tile--now abbr {
          border-bottom: 2px solid #2563eb;
          padding-bottom: 2px;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #f3f4f6 !important;
        }
        .react-calendar__navigation button[disabled] {
          background-color: transparent !important;
        }
      `}</style>
      <Calendar
        onChange={setValue}
        value={value}
        className="w-full border-none rounded-lg shadow-sm bg-white"
        tileClassName={({ date }) => {
          const dateKey = date.toISOString().split('T')[0];
          const hasEvents = events[dateKey]?.length > 0;
          return `rounded hover:bg-gray-50 transition-colors ${
            value.toDateString() === date.toDateString() ? 'bg-blue-50 text-blue-600' : ''
          } ${hasEvents ? 'font-medium' : ''}`;
        }}
        tileContent={tileContent}
        onClickDay={handleDateClick}
      />

      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            {value.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setShowEventModal(true)}
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
        </div>

        {dateEvents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-3">No events scheduled</p>
        ) : (
          <div className="space-y-2">
            {dateEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg p-2 group hover:shadow-sm transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${event.color || 'bg-blue-500'}`} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-50 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEventModal && (
        <EventModal
          selectedDate={selectedDate}
          onClose={() => setShowEventModal(false)}
          onSave={handleAddEvent}
        />
      )}
    </div>
  );
};

export default CalendarView;
