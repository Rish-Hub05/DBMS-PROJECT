// User and Auth Types
export type UserRole = 
  | 'STUDENT' 
  | 'WARDEN' 
  | 'STAFF' 
  | 'ADMIN' 
  | 'PLUMBER' 
  | 'IT_STAFF' 
  | 'CLEANER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  hostelId?: number | null;
  roomNo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  hostelId?: number;
  roomNo?: string;
}

// Mess Types
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SPECIAL';
export type ItemType = 'VEG' | 'NON_VEG' | 'JAIN' | 'SPECIAL';

export interface MenuItem {
  name: string;
  type: ItemType;
}

export interface MessMenu {
  id: number;
  date: string;
  mealType: MealType;
  servingTime?: string;
  items: MenuItem[];
  isRecurring: boolean;
  recurrenceRule?: string;
  recurrenceEndsAt?: string;
  baseMenuId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealFeedback {
  id: number;
  userId: number;
  menuId: number;
  rating: number;
  comment?: string;
  photoUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  menu?: MessMenu;
}

export interface CreateMenuData {
  date: string;
  mealType: MealType;
  servingTime: string;
  items: MenuItem[];
}

export interface CreateFeedbackData {
  menuId: number;
  rating: number;
  comment?: string;
}

// Transport Types
export type VehicleStatus = 'AVAILABLE' | 'IN_MAINTENANCE' | 'UNAVAILABLE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Vehicle {
  id: number;
  type: string;
  number: string;
  capacity: number;
  status: VehicleStatus;
  driverId?: number;
  driver?: Driver;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: number;
  name: string;
  licenseNo: string;
  phone: string;
  email?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: number;
  name: string;
  description?: string;
  startPoint: string;
  endPoint: string;
  stops: string[];
  schedules?: Schedule[];
  vehicles?: Vehicle[];
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: number;
  routeId: number;
  vehicleId: number;
  day: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  price: number;
  isActive: boolean;
  route?: Route;
  vehicle?: Vehicle;
  _count?: {
    bookings: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TransportBooking {
  id: number;
  userId: number;
  vehicleId: number;
  scheduleId: number;
  status: BookingStatus;
  bookingDate: string;
  schedule?: Schedule;
  vehicle?: Vehicle;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  scheduleId: number;
  bookingDate: string;
}

export interface CreateScheduleData {
  routeId: number;
  vehicleId: number;
  day: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  price: number;
}

// Water Types
export type IssueStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface WaterIssue {
  id: number;
  title: string;
  description: string;
  location: string;
  status: IssueStatus;
  priority: Priority;
  userId: number;
  plumberId?: number;
  images: string[];
  reportedBy?: {
    name: string;
    email: string;
    roomNo?: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWaterIssueData {
  title: string;
  description: string;
  location: string;
  priority?: Priority;
  images?: string[];
}

export interface UpdateWaterIssueData {
  status?: IssueStatus;
  plumberId?: number;
}

// Network Types
export type NetworkIssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
export type NetworkIssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NetworkIssueType = 'CONNECTIVITY' | 'SPEED' | 'AUTHENTICATION' | 'OTHER';

export interface NetworkIssue {
  id: number;
  title: string;
  description: string;
  issueType: NetworkIssueType;
  status: NetworkIssueStatus;
  priority: NetworkIssuePriority;
  ipAddress?: string;
  macAddress?: string;
  speedTest?: any;
  userId: number;
  assignedToId?: number;
  reportedBy?: {
    name: string;
    email: string;
    roomNo?: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  comments?: NetworkComment[];
  createdAt: string;
  updatedAt: string;
}

export interface NetworkComment {
  id: number;
  content: string;
  issueId: number;
  authorId: number;
  author?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateNetworkIssueData {
  title: string;
  description: string;
  issueType: NetworkIssueType;
  priority?: NetworkIssuePriority;
  ipAddress?: string;
  macAddress?: string;
  speedTest?: any;
}

export interface UpdateNetworkIssueData {
  status?: NetworkIssueStatus;
  assignedToId?: number;
}

// Cleaning Types
export type CleaningType = 'REGULAR' | 'DEEP' | 'SPECIAL';
export type CleaningStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CleaningRequest {
  id: number;
  studentId: number;
  room: string;
  building: string;
  cleaningType: CleaningType;
  status: CleaningStatus;
  scheduledDate: string;
  timeSlot: string;
  specialInstructions?: string;
  cleanerId?: number;
  rating?: number;
  feedback?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  student?: {
    id: number;
    name: string;
    email: string;
    roomNo?: string;
  };
  cleaner?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCleaningRequestData {
  room: string;
  building: string;
  cleaningType: CleaningType;
  scheduledDate: string;
  timeSlot: string;
  specialInstructions?: string;
}

export interface UpdateCleaningRequestData {
  status?: CleaningStatus;
  cleanerId?: number;
}

export interface SubmitCleaningFeedbackData {
  rating: number;
  feedback?: string;
}

// Comment Type
export interface Comment {
  id: number;
  content: string;
  issueId: number;
  userId: number;
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface ApiError {
  error: string;
  details?: string;
  errors?: Array<{ field: string; message: string }>;
}
