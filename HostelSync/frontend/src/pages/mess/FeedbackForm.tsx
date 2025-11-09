import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';
import { messApi } from '@/services/api';
import { feedbackSchema, type FeedbackFormData } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface FeedbackFormProps {
  menuId: number;
  onSuccess: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ menuId, onSuccess }) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      menuId,
      rating: 0,
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: messApi.submitFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mess-feedback'] });
      toast.success('Feedback submitted successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
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

      {/* Comment */}
      <Textarea
        label="Comment (Optional)"
        placeholder="Share your thoughts about the meal..."
        rows={4}
        error={errors.comment?.message}
        {...register('comment')}
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
