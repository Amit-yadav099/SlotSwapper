import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, ArrowRight, Edit2, Trash2, Loader } from 'lucide-react';
import type { Event, EventFormData } from '../types';
import { eventAPI } from '../utils/api';
import EventForm from '../components/EventForm';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (data: EventFormData) => {
    try {
      await eventAPI.create(data);
      await fetchEvents();
      setShowEventForm(false);
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Error creating event');
    }
  };

  const handleUpdateEvent = async (data: EventFormData) => {
    if (!editingEvent) return;
    
    try {
      setActionLoading(editingEvent._id);
      await eventAPI.update(editingEvent._id, data);
      await fetchEvents();
      setEditingEvent(null);
    } catch (error: any) {
      console.error('Error updating event:', error);
      alert(error.response?.data?.message || 'Error updating event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      setActionLoading(eventId);
      await eventAPI.delete(eventId);
      await fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert(error.response?.data?.message || 'Error deleting event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (event: Event) => {
    const newStatus = event.status === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
    
    try {
      setActionLoading(event._id);
      await eventAPI.updateStatus(event._id, newStatus);
      await fetchEvents();
    } catch (error: any) {
      console.error('Error updating event status:', error);
      alert(error.response?.data?.message || 'Error updating event status');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SWAPPABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SWAP_PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Calendar</h1>
              <p className="text-gray-600 mt-2">Manage your events and make them available for swapping</p>
            </div>
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first event</p>
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                {/* Event Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}
                  >
                    {event.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Event Time */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{formatDate(event.startTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleStatus(event)}
                    disabled={actionLoading === event._id || event.status === 'SWAP_PENDING'}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-1 text-sm"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>
                      {event.status === 'SWAPPABLE' ? 'Make Busy' : 
                       event.status === 'BUSY' ? 'Make Swappable' : 'Swap Pending'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => setEditingEvent(event)}
                    disabled={actionLoading === event._id}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    disabled={actionLoading === event._id}
                    className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Loading Overlay */}
                {actionLoading === event._id && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 rounded-xl flex items-center justify-center">
                    <Loader className="h-6 w-6 text-primary-600 animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Event Form Modal */}
        {showEventForm && (
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setShowEventForm(false)}
          />
        )}

        {editingEvent && (
          <EventForm
            event={editingEvent}
            onSubmit={handleUpdateEvent}
            onCancel={() => setEditingEvent(null)}
            loading={actionLoading === editingEvent._id}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;