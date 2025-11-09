import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { cleaningApi } from '@/services/api';
import { createCleaningRequestSchema, type CreateCleaningRequestFormData } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface CreateCleaningRequestFormProps {
  onSuccess: () => void;
}

export const CreateCleaningRequestForm: React.FC<CreateCleaningRequestFormProps> = ({
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCleaningRequestFormData>({
    resolver: zodResolver(createCleaningRequestSchema),
  });

  const createMutation = useMutation({
    mutationFn: cleaningApi.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-requests'] });
      toast.success('Cleaning request created successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to create request');
    },
  });

  const onSubmit = (data: CreateCleaningRequestFormData) => {
    createMutation.mutate(data);
  };

  const cleaningTypeOptions = [
    { value: 'REGULAR', label: 'Regular Cleaning' },
    { value: 'DEEP', label: 'Deep Cleaning' },
    { value: 'SPECIAL', label: 'Special Cleaning' },
  ];

  const timeSlotOptions = [
    { value: '08:00 - 10:00', label: '08:00 - 10:00 AM' },
    { value: '10:00 - 12:00', label: '10:00 AM - 12:00 PM' },
    { value: '14:00 - 16:00', label: '02:00 - 04:00 PM' },
    { value: '16:00 - 18:00', label: '04:00 - 06:00 PM' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Room Number"
          placeholder="e.g., 101"
          error={errors.room?.message}
          {...register('room')}
        />

        <Input
          label="Building"
          placeholder="e.g., Block A"
          error={errors.building?.message}
          {...register('building')}
        />
      </div>

      <Select
        label="Cleaning Type"
        options={cleaningTypeOptions}
        error={errors.cleaningType?.message}
        {...register('cleaningType')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Scheduled Date"
          type="date"
          min={new Date().toISOString().split('T')[0]}
          error={errors.scheduledDate?.message}
          {...register('scheduledDate')}
        />

        <Select
          label="Time Slot"
          options={timeSlotOptions}
          error={errors.timeSlot?.message}
          {...register('timeSlot')}
        />
      </div>

      <Textarea
        label="Special Instructions (Optional)"
        placeholder="Any specific requirements or areas to focus on..."
        rows={3}
        error={errors.specialInstructions?.message}
        {...register('specialInstructions')}
      />

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" isLoading={createMutation.isPending}>
          Submit Request
        </Button>
      </div>
    </form>
  );
};
