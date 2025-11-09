import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  UtensilsCrossed, 
  Bus, 
  Droplet, 
  Wifi, 
  Sparkles, 
  Users,
  Settings,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Mess Menu', path: '/mess', icon: UtensilsCrossed },
  { name: 'Transport', path: '/transport', icon: Bus },
  { name: 'Water Issues', path: '/water', icon: Droplet },
  { name: 'Network Issues', path: '/network', icon: Wifi },
  { name: 'Cleaning', path: '/cleaning', icon: Sparkles },
  { 
    name: 'User Management', 
    path: '/admin/users', 
    icon: Users,
    roles: ['ADMIN']
  },
];

export const Sidebar: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary-600">HostelSync</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )
            }
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
