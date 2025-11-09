import { type ClassValue, clsx } from 'clsx';
import { format, parseISO } from 'date-fns';

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format date utilities
export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'PPP p');
}

export function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
}

// Status badge color utilities
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    OPEN: 'bg-yellow-100 text-yellow-800',
    AVAILABLE: 'bg-green-100 text-green-800',
    IN_MAINTENANCE: 'bg-orange-100 text-orange-800',
    UNAVAILABLE: 'bg-gray-100 text-gray-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
}

// Role utilities
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    STUDENT: 'Student',
    WARDEN: 'Warden',
    STAFF: 'Staff',
    ADMIN: 'Admin',
    PLUMBER: 'Plumber',
    IT_STAFF: 'IT Staff',
    CLEANER: 'Cleaner',
  };
  return roleNames[role] || role;
}

// Download file utility
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Truncate text
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Capitalize first letter
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}
