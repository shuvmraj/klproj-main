import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';
import { Event, Role } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { EventCard } from '../components/EventCard';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../contexts/SocketContext';
import { eventsAPI } from '../src/api/events';

const Calendar: React.FC<{
  currentDate: Date;
  changeMonth: (delta: number) => void;
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  eventDays: Set<number>;
  reminderDays: Set<number>;
}> = ({ currentDate, changeMonth, selectedDate, onDateChange, eventDays, reminderDays }) => {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const today = new Date();
  const isCurrentMonthInView = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">{ICONS.chevronLeft}</button>
        <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">{monthName} {currentYear}</h3>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">{ICONS.chevronRight}</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="font-semibold text-slate-400 dark:text-slate-500 text-xs">{day.charAt(0)}</div>)}
        {emptyDays.map(d => <div key={`empty-${d}`} />)}
        {days.map(day => {
          const date = new Date(currentYear, currentMonth, day);
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isToday = isCurrentMonthInView && day === today.getDate();
          const hasEvent = eventDays.has(day);
          const hasReminder = reminderDays.has(day);

          const buttonClasses = `
            h-10 w-10 rounded-full flex items-center justify-center relative 
            transition-all duration-200 ease-in-out transform 
            hover:bg-red-100 dark:hover:bg-red-900/20 
            ${isToday && !isSelected ? 'text-red-600 dark:text-red-400 font-bold' : ''}
            ${isSelected ? 'bg-gradient-to-br from-red-500 to-red-700 text-white font-bold shadow-lg scale-110' : ''}
          `;

          return (
            <div key={day} className="py-1 flex justify-center items-center">
              <button
                onClick={() => onDateChange(date)}
                className={buttonClasses}
              >
                <span>{day}</span>
                {(hasEvent || hasReminder) && (
                  <div className="absolute bottom-1.5 flex items-center justify-center w-full space-x-1">
                    {hasEvent && !hasReminder && <span key="event" className="h-1.5 w-1.5 bg-red-400 rounded-full"></span>}
                    {hasReminder && <span key="reminder" className="h-1.5 w-1.5 bg-yellow-400 rounded-full"></span>}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reminders, setReminders] = useState<Set<string>>(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      setIsLoading(true);
      
      try {
        const response = await eventsAPI.getEvents();
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [user]);
  
  // Listen for real-time event updates
  useEffect(() => {
    if (!socket) return;
    
    socket.on('new-event', (newEvent) => {
      setEvents(prevEvents => [newEvent, ...prevEvents]);
    });
    
    return () => {
      socket.off('new-event');
    };
  }, [socket]);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
    } else {
        navigate('/home', { replace: true });
    }
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const changeMonth = (delta: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(1); // Avoid issues with different month lengths
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const toggleReminder = (eventId: string) => {
    setReminders(prev => {
        const newReminders = new Set(prev);
        if (newReminders.has(eventId)) {
            newReminders.delete(eventId);
        } else {
            newReminders.add(eventId);
        }
        return newReminders;
    });
  };

  const eventDaysInView = useMemo(() => {
    return new Set(
      events
        .map(e => new Date(e.date))
        .filter(d => d.getMonth() === currentMonth && d.getFullYear() === currentYear)
        .map(d => d.getDate())
    );
  }, [events, currentMonth, currentYear]);
  
  const reminderDaysInView = useMemo(() => {
    return new Set(
      events
        .filter(e => reminders.has(e.id))
        .map(e => new Date(e.date))
        .filter(d => d.getMonth() === currentMonth && d.getFullYear() === currentYear)
        .map(d => d.getDate())
    );
  }, [events, reminders, currentMonth, currentYear]);

  const filteredEvents = useMemo(() => {
    if (!selectedDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return events
            .filter(event => new Date(event.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return events.filter(event => new Date(event.date).toDateString() === selectedDate.toDateString());
  }, [events, selectedDate]);

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const eventData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      date: new Date(formData.get('date') as string).toISOString()
    };
    
    try {
      const response = await eventsAPI.createEvent(eventData);
      // The socket will handle adding the new event to the list
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:h-full">
      <div className="md:col-span-1">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                 <button onClick={handleBack} className="md:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
                    {ICONS.chevronLeft}
                </button>
                <h1 className="text-3xl font-bold">Events</h1>
            </div>
            {(user?.role === Role.TEACHER || user?.role === 'faculty') && (
              <Button onClick={() => setIsModalOpen(true)}>Create Event</Button>
            )}
        </div>
        <Calendar 
          currentDate={currentDate}
          changeMonth={changeMonth}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          eventDays={eventDaysInView}
          reminderDays={reminderDaysInView}
        />
        {selectedDate && <Button variant="secondary" className="w-full mt-4" onClick={() => setSelectedDate(null)}>Clear Filter</Button>}
      </div>
      <div className="md:col-span-2 space-y-6 md:overflow-y-auto">
        <h2 className="text-2xl font-bold">{selectedDate ? `Events on ${selectedDate.toLocaleDateString()}` : "Upcoming Events"}</h2>
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => <EventCard key={event.id} event={event} isReminderSet={reminders.has(event.id)} onToggleReminder={toggleReminder} />)
        ) : (
          <Card>
            <p className="text-center py-12 text-slate-500 dark:text-slate-400">No events found.</p>
          </Card>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Event">
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input name="title" label="Event Title" placeholder="e.g., Tech Summit" required />
          <Input name="description" label="Description" placeholder="What's the event about?" required />
          <Input name="location" label="Location" placeholder="e.g., Grand Hall" required />
          <Input name="date" label="Date and Time" type="datetime-local" required />
          <div className="flex justify-end pt-4">
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};