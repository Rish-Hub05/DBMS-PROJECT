import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';
import { cleaningApi } from '@/services/api';
import { cleaningFeedbackSchema, type SubmitCleaningFeedbackData } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface CleaningFeedbackFormProps {
  requestId: number;
  onSuccess: () => void;
}

export const CleaningFeedbackForm: React.FC<CleaningFeedbackFormProps> = ({
  requestId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SubmitCleaningFeedbackData>({
    resolver: zodResolver(cleaningFeedbackSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (data: SubmitCleaningFeedbackData) => cleaningApi.submitFeedback(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-requests'] });
      toast.success('Feedback submitted successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    },
  });

  const onSubmit = (data: SubmitCleaningFeedbackData) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    feedbackMutation.mutate({ ...data, rating });
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    setValue('rating', value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hover || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
        )}
      </div>

      {/* Feedback */}
      <Textarea
        label="Feedback (Optional)"
        placeholder="Share your experience with the cleaning service..."
        rows={4}
        error={errors.feedback?.message}
        {...register('feedback')}
      />

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" isLoading={feedbackMutation.isPending}>
          Submit Feedback
        </Button>
      </div>
    </form>
  );
};
