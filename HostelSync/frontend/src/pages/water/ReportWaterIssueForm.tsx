import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { waterApi } from '@/services/api';
import { createWaterIssueSchema, type CreateWaterIssueFormData } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface ReportWaterIssueFormProps {
  onSuccess: () => void;
}

export const ReportWaterIssueForm: React.FC<ReportWaterIssueFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateWaterIssueFormData>({
    resolver: zodResolver(createWaterIssueSchema),
  });

  const reportMutation = useMutation({
    mutationFn: waterApi.reportIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-issues'] });
      toast.success('Issue reported successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to report issue');
    },
  });

  const onSubmit = (data: CreateWaterIssueFormData) => {
    reportMutation.mutate(data);
  };

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Title"
        placeholder="Brief description of the issue"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description"
        placeholder="Provide detailed information about the issue..."
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      <Input
        label="Location"
        placeholder="e.g., Block A, Room 101"
        error={errors.location?.message}
        {...register('location')}
      />

      <Select
        label="Priority"
        options={priorityOptions}
        error={errors.priority?.message}
        {...register('priority')}
      />

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" isLoading={reportMutation.isPending}>
          Report Issue
        </Button>
      </div>
    </form>
  );
};
