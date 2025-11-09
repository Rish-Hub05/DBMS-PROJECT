import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Bus, MapPin, Clock, Users, Calendar } from 'lucide-react';
import { transportApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { BookingForm } from './BookingForm';
import { formatDate, formatTime, getStatusColor } from '@/lib/utils';
import type { Route, TransportBooking } from '@/types';

export const TransportPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['transport-routes'],
    queryFn: transportApi.getRoutes,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['transport-bookings'],
    queryFn: transportApi.getUserBookings,
    enabled: user?.role === 'STUDENT',
  });

  const cancelMutation = useMutation({
    mutationFn: transportApi.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: () => {
      toast.error('Failed to cancel booking');
    },
  });

  const handleBook = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
    setShowBookingModal(true);
  };

  const handleCancel = (bookingId: number) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate(bookingId);
    }
  };

  if (routesLoading || bookingsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transport Services</h1>
        <p className="mt-2 text-gray-600">Book transport and view your bookings</p>
      </div>

      {/* My Bookings */}
      {user?.role === 'STUDENT' && bookings && bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">
                        {booking.schedule?.route?.name || 'Route'}
                      </h4>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(booking.bookingDate)}
                      </p>
                      <p className="flex items-center">
                        <Bus className="mr-2 h-4 w-4" />
                        {booking.vehicle?.type} - {booking.vehicle?.number}
                      </p>
                    </div>
                  </div>
                  {booking.status === 'CONFIRMED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      isLoading={cancelMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Routes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Routes</h2>
        {!routes || routes.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={Bus}
                title="No routes available"
                description="There are no transport routes configured yet."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {routes.map((route) => (
              <Card key={route.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bus className="mr-2 h-5 w-5 text-primary-600" />
                    {route.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Route Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <MapPin className="mr-2 h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {route.startPoint} → {route.endPoint}
                        </p>
                        {route.description && (
                          <p className="text-sm text-gray-600 mt-1">{route.description}</p>
                        )}
                      </div>
                    </div>

                    {route.stops && route.stops.length > 0 && (
                      <div className="flex items-start">
                        <MapPin className="mr-2 h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Stops:</p>
                          <p className="text-sm text-gray-600">{route.stops.join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Schedules */}
                  {route.schedules && route.schedules.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Schedules</h4>
                      <div className="space-y-2">
                        {route.schedules
                          .filter((schedule) => schedule.isActive)
                          .map((schedule) => (
                            <div
                              key={schedule.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {schedule.day}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                  </span>
                                </div>
                                <div className="flex items-center mt-1 space-x-3 text-xs text-gray-600">
                                  <span className="flex items-center">
                                    <Users className="mr-1 h-3 w-3" />
                                    {schedule._count?.bookings || 0}/{schedule.maxCapacity}
                                  </span>
                                  <span>₹{schedule.price}</span>
                                </div>
                              </div>
                              {user?.role === 'STUDENT' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleBook(schedule.id)}
                                  disabled={
                                    (schedule._count?.bookings || 0) >= schedule.maxCapacity
                                  }
                                >
                                  Book
                                </Button>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedScheduleId(null);
        }}
        title="Book Transport"
      >
        {selectedScheduleId && (
          <BookingForm
            scheduleId={selectedScheduleId}
            onSuccess={() => {
              setShowBookingModal(false);
              setSelectedScheduleId(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};
