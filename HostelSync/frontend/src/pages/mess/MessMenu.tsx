import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Plus, Calendar, Clock, Trash2 } from 'lucide-react';
import { messApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { CreateMenuForm } from './CreateMenuForm';
import { FeedbackForm } from './FeedbackForm';
import { formatDate, formatTime } from '@/lib/utils';
import type { MessMenu } from '@/types';

export const MessMenuPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MessMenu | null>(null);

  const { data: menus, isLoading } = useQuery({
    queryKey: ['mess-menu'],
    queryFn: messApi.getWeeklyMenu,
  });

  const deleteMutation = useMutation({
    mutationFn: messApi.deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mess-menu'] });
      toast.success('Menu deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete menu');
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this menu?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFeedback = (menu: MessMenu) => {
    setSelectedMenu(menu);
    setShowFeedbackModal(true);
  };

  const canManageMenu = user?.role === 'ADMIN' || user?.role === 'STAFF';

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const groupedMenus = menus?.reduce((acc, menu) => {
    const date = menu.date.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(menu);
    return acc;
  }, {} as Record<string, MessMenu[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mess Menu</h1>
          <p className="mt-2 text-gray-600">View weekly menu and submit feedback</p>
        </div>
        {canManageMenu && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu
          </Button>
        )}
      </div>

      {/* Menu List */}
      {!menus || menus.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Calendar}
              title="No menu available"
              description="The weekly menu hasn't been added yet."
              action={
                canManageMenu ? (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Menu
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMenus || {}).map(([date, dayMenus]) => (
            <Card key={date}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                    {formatDate(date, 'EEEE, MMMM d, yyyy')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{menu.mealType}</h4>
                          {menu.servingTime && (
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatTime(menu.servingTime)}
                            </p>
                          )}
                        </div>
                        {canManageMenu && (
                          <button
                            onClick={() => handleDelete(menu.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {menu.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{item.name}</span>
                            <Badge
                              variant={
                                item.type === 'VEG'
                                  ? 'success'
                                  : item.type === 'NON_VEG'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {item.type}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {user?.role === 'STUDENT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => handleFeedback(menu)}
                        >
                          Submit Feedback
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Menu Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Menu"
        size="lg"
      >
        <CreateMenuForm onSuccess={() => setShowCreateModal(false)} />
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedMenu(null);
        }}
        title="Submit Feedback"
      >
        {selectedMenu && (
          <FeedbackForm
            menuId={selectedMenu.id}
            onSuccess={() => {
              setShowFeedbackModal(false);
              setSelectedMenu(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};
