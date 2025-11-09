import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wifi, Plus } from 'lucide-react';
import { networkApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { ReportNetworkIssueForm } from './ReportNetworkIssueForm';
import { UpdateNetworkIssueForm } from './UpdateNetworkIssueForm';
import { formatDateTime, getStatusColor, getPriorityColor } from '@/lib/utils';
import type { NetworkIssue } from '@/types';

export const NetworkIssuesPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<NetworkIssue | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: issues, isLoading } = useQuery({
    queryKey: ['network-issues', statusFilter],
    queryFn: () => networkApi.getIssues(statusFilter || undefined),
  });

  const handleUpdate = (issue: NetworkIssue) => {
    setSelectedIssue(issue);
    setShowUpdateModal(true);
  };

  const canUpdateIssues = user?.role === 'ADMIN' || user?.role === 'IT_STAFF';

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Network Issues</h1>
          <p className="mt-2 text-gray-600">Report and track network connectivity issues</p>
        </div>
        <Button onClick={() => setShowReportModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Report Issue
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <Select
            label="Filter by Status"
            options={[
              { value: '', label: 'All' },
              { value: 'OPEN', label: 'Open' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'RESOLVED', label: 'Resolved' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Issues List */}
      {!issues || issues.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Wifi}
              title="No issues found"
              description="No network issues have been reported yet."
              action={
                <Button onClick={() => setShowReportModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Report First Issue
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {issues.map((issue) => (
            <Card key={issue.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                      <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                      <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                      <Badge variant="info">{issue.issueType}</Badge>
                    </div>

                    <p className="text-gray-700 mb-3">{issue.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>
                        Reported by: <strong>{issue.reportedBy?.name}</strong>
                      </span>
                      {issue.assignedTo && (
                        <span>
                          Assigned to: <strong>{issue.assignedTo.name}</strong>
                        </span>
                      )}
                      {issue.ipAddress && <span>IP: {issue.ipAddress}</span>}
                      {issue.macAddress && <span>MAC: {issue.macAddress}</span>}
                      <span>{formatDateTime(issue.createdAt)}</span>
                    </div>
                  </div>

                  {canUpdateIssues && issue.status !== 'RESOLVED' && (
                    <Button size="sm" onClick={() => handleUpdate(issue)}>
                      Update Status
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report Issue Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Network Issue"
        size="lg"
      >
        <ReportNetworkIssueForm onSuccess={() => setShowReportModal(false)} />
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedIssue(null);
        }}
        title="Update Issue Status"
      >
        {selectedIssue && (
          <UpdateNetworkIssueForm
            issue={selectedIssue}
            onSuccess={() => {
              setShowUpdateModal(false);
              setSelectedIssue(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};
