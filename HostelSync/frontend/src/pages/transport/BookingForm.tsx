import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { transportApi } from '@/services/api';
import { createBookingSchema, type CreateBookingFormData } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface BookingFormProps {
  scheduleId: number;
  onSuccess: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ scheduleId, onSuccess }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      scheduleId,
      bookingDate: new Date().toISOString().split('T')[0],
    },
  });

  const bookingMutation = useMutation({
    mutationFn: transportApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['transport-routes'] });
      toast.success('Booking created successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create booking');
    },
  });

  const onSubmit = (data: CreateBookingFormData) => {
    bookingMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Booking Date"
        type="date"
        min={new Date().toISOString().split('T')[0]}
        error={errors.bookingDate?.message}
        {...register('bookingDate')}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> You can only book for future dates. Make sure to arrive at the
          pickup point 10 minutes before departure time.
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" isLoading={bookingMutation.isPending}>
          Confirm Booking
        </Button>
      </div>
    </form>
  );
};
