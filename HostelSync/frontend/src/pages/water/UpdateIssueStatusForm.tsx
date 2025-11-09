import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { waterApi } from '@/services/api';
import { updateWaterIssueSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { WaterIssue, UpdateWaterIssueData } from '@/types';

interface UpdateIssueStatusFormProps {
  issue: WaterIssue;
  onSuccess: () => void;
}

export const UpdateIssueStatusForm: React.FC<UpdateIssueStatusFormProps> = ({
  issue,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateWaterIssueData>({
    resolver: zodResolver(updateWaterIssueSchema),
    defaultValues: {
      status: issue.status,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateWaterIssueData) => waterApi.updateIssueStatus(issue.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-issues'] });
      toast.success('Issue updated successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to update issue');
    },
  });

  const onSubmit = (data: UpdateWaterIssueData) => {
    updateMutation.mutate(data);
  };

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">{issue.title}</h4>
        <p className="text-sm text-gray-600">{issue.description}</p>
      </div>

      <Select
        label="Status"
        options={statusOptions}
        error={errors.status?.message}
        {...register('status')}
      />

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" isLoading={updateMutation.isPending}>
          Update Status
        </Button>
      </div>
    </form>
  );
};
