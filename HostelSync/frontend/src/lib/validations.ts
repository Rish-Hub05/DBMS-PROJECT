import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'WARDEN', 'STAFF', 'ADMIN', 'PLUMBER', 'IT_STAFF', 'CLEANER']).optional(),
  hostelId: z.number().optional(),
  roomNo: z.string().optional(),
});

// Mess Schemas
export const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  type: z.enum(['VEG', 'NON_VEG', 'JAIN', 'SPECIAL']),
});

export const createMenuSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SPECIAL']),
  servingTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  items: z.array(menuItemSchema).min(1, 'At least one item is required'),
});

export const feedbackSchema = z.object({
  menuId: z.number().positive('Menu ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().optional(),
});

// Transport Schemas
export const createBookingSchema = z.object({
  scheduleId: z.number().positive('Schedule is required'),
  bookingDate: z.string().min(1, 'Booking date is required'),
});

export const createScheduleSchema = z.object({
  routeId: z.number().positive('Route is required'),
  vehicleId: z.number().positive('Vehicle is required'),
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:MM)'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  maxCapacity: z.number().min(1, 'Capacity must be at least 1'),
  price: z.number().min(0, 'Price cannot be negative'),
});

// Water Issue Schemas
export const createWaterIssueSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  images: z.array(z.string()).optional(),
});

export const updateWaterIssueSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']).optional(),
  plumberId: z.number().positive().optional(),
});

// Network Issue Schemas
export const createNetworkIssueSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  issueType: z.enum(['CONNECTIVITY', 'SPEED', 'AUTHENTICATION', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
});

export const updateNetworkIssueSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED']).optional(),
  assignedToId: z.number().positive().optional(),
});

// Cleaning Schemas
export const createCleaningRequestSchema = z.object({
  room: z.string().min(1, 'Room number is required'),
  building: z.string().min(1, 'Building is required'),
  cleaningType: z.enum(['REGULAR', 'DEEP', 'SPECIAL']),
  scheduledDate: z.string().min(1, 'Date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  specialInstructions: z.string().optional(),
});

export const updateCleaningRequestSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  cleanerId: z.number().positive().optional(),
});

export const cleaningFeedbackSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  feedback: z.string().optional(),
});

// User Management Schemas
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'WARDEN', 'STAFF', 'ADMIN', 'PLUMBER', 'IT_STAFF', 'CLEANER']),
  roomNo: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['STUDENT', 'WARDEN', 'STAFF', 'ADMIN', 'PLUMBER', 'IT_STAFF', 'CLEANER']).optional(),
  roomNo: z.string().optional(),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateMenuFormData = z.infer<typeof createMenuSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
export type CreateBookingFormData = z.infer<typeof createBookingSchema>;
export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;
export type CreateWaterIssueFormData = z.infer<typeof createWaterIssueSchema>;
export type CreateNetworkIssueFormData = z.infer<typeof createNetworkIssueSchema>;
export type CreateCleaningRequestFormData = z.infer<typeof createCleaningRequestSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
