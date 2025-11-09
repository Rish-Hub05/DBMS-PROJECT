import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Calendar } from 'lucide-react';
import { cleaningApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { CreateCleaningRequestForm } from './CreateCleaningRequestForm';
import { CleaningFeedbackForm } from './CleaningFeedbackForm';
import { formatDate, getStatusColor } from '@/lib/utils';
import type { CleaningRequest } from '@/types';

export const CleaningPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CleaningRequest | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['cleaning-requests'],
    queryFn: cleaningApi.getMyRequests,
    enabled: user?.role === 'STUDENT',
  });

  const handleFeedback = (request: CleaningRequest) => {
    setSelectedRequest(request);
    setShowFeedbackModal(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cleaning Services</h1>
          <p className="mt-2 text-gray-600">Request cleaning services for your room</p>
        </div>
        {user?.role === 'STUDENT' && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        )}
      </div>

      {/* Requests List */}
      {!requests || requests.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Sparkles}
              title="No requests found"
              description="You haven't made any cleaning requests yet."
              action={
                user?.role === 'STUDENT' ? (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Request
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.cleaningType} Cleaning
                      </h3>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <strong>Location:</strong> {request.building}, Room {request.room}
                      </p>
                      <p className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {formatDate(request.scheduledDate)} - {request.timeSlot}
                      </p>
                      {request.specialInstructions && (
                        <p>
                          <strong>Instructions:</strong> {request.specialInstructions}
                        </p>
                      )}
                      {request.cleaner && (
                        <p>
                          <strong>Assigned to:</strong> {request.cleaner.name}
                        </p>
                      )}
                      {request.rating && (
                        <p>
                          <strong>Rating:</strong> {'⭐'.repeat(request.rating)}
                        </p>
                      )}
                    </div>
                  </div>

                  {request.status === 'COMPLETED' && !request.rating && (
                    <Button size="sm" onClick={() => handleFeedback(request)}>
                      Submit Feedback
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Request Cleaning Service"
        size="lg"
      >
        <CreateCleaningRequestForm onSuccess={() => setShowCreateModal(false)} />
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedRequest(null);
        }}
        title="Submit Feedback"
      >
        {selectedRequest && (
          <CleaningFeedbackForm
            requestId={selectedRequest.id}
            onSuccess={() => {
              setShowFeedbackModal(false);
              setSelectedRequest(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};
