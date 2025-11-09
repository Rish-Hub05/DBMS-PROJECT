import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { adminApi } from '@/services/api';
import { createUserSchema, type CreateUserFormData } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface CreateUserFormProps {
  onSuccess: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User created successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create user');
    },
  });

  const onSubmit = (data: CreateUserFormData) => {
    createMutation.mutate(data);
  };

  const roleOptions = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'STAFF', label: 'Staff' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'CLEANER', label: 'Cleaner' },
    { value: 'PLUMBER', label: 'Plumber' },
    { value: 'IT_STAFF', label: 'IT Staff' },
    { value: 'WARDEN', label: 'Warden' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Full Name"
        placeholder="John Doe"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="john.doe@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <Select
        label="Role"
        options={roleOptions}
        error={errors.role?.message}
        {...register('role')}
      />

      <Input
        label="Room Number (Optional)"
        placeholder="e.g., A-101"
        error={errors.roomNo?.message}
        {...register('roomNo')}
      />

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" isLoading={createMutation.isPending}>
          Create User
        </Button>
      </div>
    </form>
  );
};
