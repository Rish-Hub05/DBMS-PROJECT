import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { messApi } from '@/services/api';
import { createMenuSchema, type CreateMenuFormData } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface CreateMenuFormProps {
  onSuccess: () => void;
}

export const CreateMenuForm: React.FC<CreateMenuFormProps> = ({ onSuccess }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateMenuFormData>({
    resolver: zodResolver(createMenuSchema),
    defaultValues: {
      items: [{ name: '', type: 'VEG' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const createMutation = useMutation({
    mutationFn: messApi.createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mess-menu'] });
      toast.success('Menu created successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to create menu');
    },
  });

  const onSubmit = (data: CreateMenuFormData) => {
    createMutation.mutate(data);
  };

  const mealTypeOptions = [
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'LUNCH', label: 'Lunch' },
    { value: 'DINNER', label: 'Dinner' },
    { value: 'SPECIAL', label: 'Special' },
  ];

  const itemTypeOptions = [
    { value: 'VEG', label: 'Vegetarian' },
    { value: 'NON_VEG', label: 'Non-Vegetarian' },
    { value: 'JAIN', label: 'Jain' },
    { value: 'SPECIAL', label: 'Special' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />

        <Select
          label="Meal Type"
          options={mealTypeOptions}
          error={errors.mealType?.message}
          {...register('mealType')}
        />

        <Input
          label="Serving Time"
          type="time"
          error={errors.servingTime?.message}
          {...register('servingTime')}
        />
      </div>

      {/* Menu Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Menu Items <span className="text-red-500">*</span>
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ name: '', type: 'VEG' })}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Item name"
                  error={errors.items?.[index]?.name?.message}
                  {...register(`items.${index}.name` as const)}
                />
              </div>
              <div className="w-40">
                <Select
                  options={itemTypeOptions}
                  error={errors.items?.[index]?.type?.message}
                  {...register(`items.${index}.type` as const)}
                />
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {errors.items && (
          <p className="mt-1 text-sm text-red-600">{errors.items.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" isLoading={createMutation.isPending}>
          Create Menu
        </Button>
      </div>
    </form>
  );
};
