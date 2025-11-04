import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, ArrowRight, Loader, X } from 'lucide-react';
import type { Event } from '../types';
import { swapAPI, eventAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Marketplace: React.FC = () => {
  const [swappableSlots, setSwappableSlots] = useState<Event[]>([]);
  const [mySwappableSlots, setMySwappableSlots] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapLoading, setSwapLoading] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsResponse, myEventsResponse] = await Promise.all([
        swapAPI.getSwappableSlots(),
        eventAPI.getAll()
      ]);

      setSwappableSlots(slotsResponse.data);
      setMySwappableSlots(myEventsResponse.data.filter((event: Event) => event.status === 'SWAPPABLE'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = async (mySlotId: string) => {
    if (!selectedSlot) return;

    try {
      setSwapLoading(mySlotId);
      await swapAPI.createSwapRequest({
        mySlotId,
        theirSlotId: selectedSlot._id
      });
      
      await fetchData(); // Refresh data
      setShowSwapModal(false);
      setSelectedSlot(null);
      alert('Swap request sent successfully!');
    } catch (error: any) {
      console.error('Error creating swap request:', error);
      alert(error.response?.data?.message || 'Error sending swap request');
    } finally {
      setSwapLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const filteredSlots = swappableSlots.filter(slot =>
    slot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (slot.userId as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Swap Marketplace</h1>
          <p className="text-gray-600 mt-2">
            Discover available time slots from other users and request swaps
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by event title or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Available Slots */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSlots.map((slot) => (
            <div
              key={slot._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Event Header */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{slot.title}</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{(slot.userId as any)?.name}</span>
                </div>
              </div>

              {/* Event Time */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(slot.startTime)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedSlot(slot);
                  setShowSwapModal(true);
                }}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Request Swap</span>
              </button>
            </div>
          ))}
        </div>

        {filteredSlots.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching slots found' : 'No available slots'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Check back later for new swappable time slots'
              }
            </p>
          </div>
        )}

        {/* Swap Modal */}
        {showSwapModal && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Request Swap</h2>
                <button
                  onClick={() => {
                    setShowSwapModal(false);
                    setSelectedSlot(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Selected Slot Info */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Selected Slot</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold">{selectedSlot.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDate(selectedSlot.startTime)} • {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    by {(selectedSlot.userId as any)?.name}
                  </div>
                </div>
              </div>

              {/* My Available Slots */}
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">Choose your slot to offer:</h3>
                
                {mySwappableSlots.length === 0 ? (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">
                      You don't have any swappable slots. Mark some events as swappable first.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {mySwappableSlots.map((slot) => (
                      <div
                        key={slot._id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors duration-200"
                      >
                        <div className="font-medium text-sm">{slot.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {formatDate(slot.startTime)} • {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </div>
                        <button
                          onClick={() => handleRequestSwap(slot._id)}
                          disabled={swapLoading === slot._id}
                          className="w-full mt-2 bg-primary-600 text-white py-1.5 px-3 rounded text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {swapLoading === slot._id ? (
                            <Loader className="h-3 w-3 animate-spin mx-auto" />
                          ) : (
                            'Offer This Slot'
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;