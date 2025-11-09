import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { networkApi } from '@/services/api';
import { createNetworkIssueSchema, type CreateNetworkIssueFormData } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface ReportNetworkIssueFormProps {
  onSuccess: () => void;
}

export const ReportNetworkIssueForm: React.FC<ReportNetworkIssueFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateNetworkIssueFormData>({
    resolver: zodResolver(createNetworkIssueSchema),
  });

  const reportMutation = useMutation({
    mutationFn: networkApi.reportIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-issues'] });
      toast.success('Issue reported successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to report issue');
    },
  });

  const onSubmit = (data: CreateNetworkIssueFormData) => {
    reportMutation.mutate(data);
  };

  const issueTypeOptions = [
    { value: 'CONNECTIVITY', label: 'Connectivity' },
    { value: 'SPEED', label: 'Speed' },
    { value: 'AUTHENTICATION', label: 'Authentication' },
    { value: 'OTHER', label: 'Other' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
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

      <Select
        label="Issue Type"
        options={issueTypeOptions}
        error={errors.issueType?.message}
        {...register('issueType')}
      />

      <Select
        label="Priority"
        options={priorityOptions}
        error={errors.priority?.message}
        {...register('priority')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="IP Address (Optional)"
          placeholder="192.168.1.1"
          error={errors.ipAddress?.message}
          {...register('ipAddress')}
        />

        <Input
          label="MAC Address (Optional)"
          placeholder="00:00:00:00:00:00"
          error={errors.macAddress?.message}
          {...register('macAddress')}
        />
      </div>

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
