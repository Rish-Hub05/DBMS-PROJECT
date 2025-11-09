import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  UtensilsCrossed, 
  Bus, 
  Droplet, 
  Wifi, 
  Sparkles,
  Users
} from 'lucide-react';
import { getRoleDisplayName } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const quickLinks = [
    {
      title: 'Mess Menu',
      description: 'View weekly menu and submit feedback',
      icon: UtensilsCrossed,
      href: '/mess',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Transport',
      description: 'Book transport and view schedules',
      icon: Bus,
      href: '/transport',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Water Issues',
      description: 'Report and track water issues',
      icon: Droplet,
      href: '/water',
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      title: 'Network Issues',
      description: 'Report connectivity problems',
      icon: Wifi,
      href: '/network',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Cleaning',
      description: 'Request cleaning services',
      icon: Sparkles,
      href: '/cleaning',
      color: 'bg-green-100 text-green-600',
    },
  ];

  if (user?.role === 'ADMIN') {
    quickLinks.push({
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'bg-red-100 text-red-600',
    });
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Role: {user && getRoleDisplayName(user.role)}
          {user?.roomNo && ` • Room: ${user.roomNo}`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Bus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Droplet className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cleaning Requests</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Wifi className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${link.color}`}>
                  <link.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{link.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{link.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Transport booking confirmed</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Cleaning request assigned</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Water issue reported</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
