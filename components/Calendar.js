'use client';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/FirebaseConfig';
import { collection, query, where, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';

const COLORS = [
  { name: 'Blue', value: 'bg-primary-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Orange', value: 'bg-orange-500' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EventModal = ({ selectedDate, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0].value);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description, color });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg p-4 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
            Add Event for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-dark-card transition-all duration-200 text-gray-900 dark:text-dark-text"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-dark-card transition-all duration-200 text-gray-900 dark:text-dark-text resize-none h-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-6 h-6 rounded-full ${c.value} transition-transform duration-200 ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600 scale-110' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-border rounded-lg hover:bg-gray-200 dark:hover:bg-dark-bg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all duration-200"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CalendarView = forwardRef((props, ref) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useImperativeHandle(ref, () => ({
    openEventModal: () => {
      setShowEventModal(true);
    }
  }));

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

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const renderEventDots = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    const dateEvents = events[dateKey] || [];

    if (dateEvents.length > 0) {
      return (
        <div className="flex justify-center gap-0.5 mt-1">
          {dateEvents.slice(0, 3).map((event, index) => (
            <div
              key={event.id}
              className={`h-1 w-1 rounded-full ${event.color || 'bg-primary-500'}`}
            />
          ))}
          {dateEvents.length > 3 && (
            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          )}
        </div>
      );
    }
    return null;
  };

  if (!isClient) {
    return (
      <div className="animate-pulse">
        <div className="h-[300px] bg-gray-100 dark:bg-dark-card rounded-lg"></div>
      </div>
    );
  }

  const days = getDaysInMonth();
  const dateEvents = events[selectedDate.toISOString().split('T')[0]] || [];
  const today = new Date();

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors text-gray-600 dark:text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors text-gray-600 dark:text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Weekday Headers */}
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 py-1 sm:py-2">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`
                p-1 relative h-14 rounded-lg transition-all duration-200
                ${isSelected ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-dark-border'}
                ${!isCurrentMonth && 'text-gray-400 dark:text-gray-600'}
                ${isToday ? 'font-bold' : ''}
              `}
            >
              <div className="relative">
                <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                  {format(date, 'd')}
                </span>
                {isToday && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="h-1 w-1 bg-primary-500 rounded-full"></div>
                  </div>
                )}
              </div>
              {renderEventDots(date)}
            </button>
          );
        })}
      </div>

      {/* Events List */}
      <div className="bg-gray-50 dark:bg-dark-card rounded-lg p-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-dark-text">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <button
            onClick={() => setShowEventModal(true)}
            className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
        </div>

        {dateEvents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">No events scheduled</p>
        ) : (
          <div className="space-y-2">
            {dateEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-dark-bg rounded-lg p-2 group hover:shadow-sm transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${event.color || 'bg-primary-500'}`} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-dark-text">{event.title}</h4>
                      {event.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-gray-50 dark:hover:bg-dark-border transition-all duration-200"
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
});

CalendarView.displayName = 'CalendarView';

export default CalendarView;
