import React from 'react';
import { Bell, Clock, User, Check, X, Loader, Calendar, RefreshCw } from 'lucide-react';
import { useSwapRequests, useRespondToSwapRequest } from '../hooks/useSwaps';

const Notifications: React.FC = () => {
  const { data: requests = { incoming: [], outgoing: [] }, isLoading, error, refetch } = useSwapRequests();
  const respondToSwapRequestMutation = useRespondToSwapRequest();

  const handleRespondToRequest = async (requestId: string, accepted: boolean) => {
    try {
      await respondToSwapRequestMutation.mutateAsync({ requestId, accepted });
    } catch (error: any) {
      console.error('Error responding to swap request:', error);
      alert(error.response?.data?.message || 'Error processing request');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
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
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Failed to load notifications</div>
          <button
            onClick={() => refetch()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Bell className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">Manage your swap requests</p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Incoming Requests */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5 text-primary-600" />
              <span>Incoming Requests</span>
              {requests.incoming.length > 0 && (
                <span className="bg-primary-600 text-white text-sm px-2 py-1 rounded-full">
                  {requests.incoming.length}
                </span>
              )}
            </h2>

            {requests.incoming.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No incoming requests</h3>
                <p className="text-gray-600">You don't have any pending swap requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.incoming.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative"
                  >
                    {/* Loading Overlay */}
                    {(respondToSwapRequestMutation.isPending && respondToSwapRequestMutation.variables?.requestId === request._id) && (
                      <div className="absolute inset-0 bg-white bg-opacity-50 rounded-xl flex items-center justify-center z-10">
                        <Loader className="h-6 w-6 text-primary-600 animate-spin" />
                      </div>
                    )}

                    {/* Request Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Swap Request
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          From {request.requesterSlotId.userId.name}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    {/* Slot Details */}
                    <div className="space-y-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="font-medium text-sm text-blue-900 mb-1">
                          Their Offer
                        </div>
                        <div className="text-sm text-blue-700">
                          {request.requesterSlotId.title}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {formatTime(request.requesterSlotId.startTime)} - {formatTime(request.requesterSlotId.endTime)}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="font-medium text-sm text-green-900 mb-1">
                          Your Slot
                        </div>
                        <div className="text-sm text-green-700">
                          {request.targetSlotId.title}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          {formatTime(request.targetSlotId.startTime)} - {formatTime(request.targetSlotId.endTime)}
                        </div>
                      </div>
                    </div>

                    {/* Request Time */}
                    <div className="text-xs text-gray-500 mb-4">
                      Requested {formatDate(request.createdAt)}
                    </div>

                    {/* Actions */}
                    {request.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRespondToRequest(request._id, true)}
                          disabled={respondToSwapRequestMutation.isPending}
                          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-1 text-sm"
                        >
                          <Check className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRespondToRequest(request._id, false)}
                          disabled={respondToSwapRequestMutation.isPending}
                          className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-1 text-sm"
                        >
                          <X className="h-4 w-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              <span>Outgoing Requests</span>
              {requests.outgoing.length > 0 && (
                <span className="bg-primary-600 text-white text-sm px-2 py-1 rounded-full">
                  {requests.outgoing.length}
                </span>
              )}
            </h2>

            {requests.outgoing.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No outgoing requests</h3>
                <p className="text-gray-600">You haven't sent any swap requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.outgoing.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    {/* Request Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Your Request
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          To {request.targetSlotId.userId.name}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    {/* Slot Details */}
                    <div className="space-y-3 mb-4">
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="font-medium text-sm text-green-900 mb-1">
                          Your Offer
                        </div>
                        <div className="text-sm text-green-700">
                          {request.requesterSlotId.title}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          {formatTime(request.requesterSlotId.startTime)} - {formatTime(request.requesterSlotId.endTime)}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="font-medium text-sm text-blue-900 mb-1">
                          Requested Slot
                        </div>
                        <div className="text-sm text-blue-700">
                          {request.targetSlotId.title}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {formatTime(request.targetSlotId.startTime)} - {formatTime(request.targetSlotId.endTime)}
                        </div>
                      </div>
                    </div>

                    {/* Request Time */}
                    <div className="text-xs text-gray-500">
                      Sent {formatDate(request.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;