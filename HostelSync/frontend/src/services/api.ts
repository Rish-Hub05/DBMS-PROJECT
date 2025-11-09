import api from '@/lib/axios';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  MessMenu,
  CreateMenuData,
  MealFeedback,
  CreateFeedbackData,
  Vehicle,
  Route,
  Schedule,
  TransportBooking,
  CreateBookingData,
  CreateScheduleData,
  WaterIssue,
  CreateWaterIssueData,
  UpdateWaterIssueData,
  NetworkIssue,
  CreateNetworkIssueData,
  UpdateNetworkIssueData,
  NetworkComment,
  CleaningRequest,
  CreateCleaningRequestData,
  UpdateCleaningRequestData,
  SubmitCleaningFeedbackData,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

// ==================== AUTH API ====================
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// ==================== MESS API ====================
export const messApi = {
  getWeeklyMenu: async (): Promise<MessMenu[]> => {
    const { data } = await api.get('/mess/menu');
    return data;
  },

  createMenu: async (menuData: CreateMenuData): Promise<MessMenu> => {
    const { data } = await api.post('/mess/menu', menuData);
    return data;
  },

  updateMenu: async (id: number, menuData: Partial<CreateMenuData>): Promise<MessMenu> => {
    const { data } = await api.put(`/mess/menu/${id}`, menuData);
    return data;
  },

  deleteMenu: async (id: number): Promise<void> => {
    await api.delete(`/mess/menu/${id}`);
  },

  submitFeedback: async (feedbackData: CreateFeedbackData): Promise<MealFeedback> => {
    const { data } = await api.post('/mess/feedback', feedbackData);
    return data;
  },

  getFeedback: async (): Promise<MealFeedback[]> => {
    const { data } = await api.get('/mess/feedback');
    return data;
  },

  exportMenus: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const { data } = await api.get('/mess/menus/export', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return data;
  },
};

// ==================== TRANSPORT API ====================
export const transportApi = {
  getVehicles: async (): Promise<Vehicle[]> => {
    const { data } = await api.get('/transport/vehicles');
    return data;
  },

  getRoutes: async (): Promise<Route[]> => {
    const { data } = await api.get('/transport/routes');
    return data;
  },

  createBooking: async (bookingData: CreateBookingData): Promise<TransportBooking> => {
    const { data } = await api.post('/transport/bookings', bookingData);
    return data;
  },

  getUserBookings: async (): Promise<TransportBooking[]> => {
    const { data } = await api.get('/transport/bookings/me');
    return data;
  },

  cancelBooking: async (id: number): Promise<TransportBooking> => {
    const { data } = await api.delete(`/transport/bookings/${id}`);
    return data;
  },

  createSchedule: async (scheduleData: CreateScheduleData): Promise<Schedule> => {
    const { data } = await api.post('/transport/admin/schedules', scheduleData);
    return data;
  },

  deleteVehicle: async (id: number): Promise<void> => {
    await api.delete(`/transport/admin/vehicles/${id}`);
  },
};

// ==================== WATER API ====================
export const waterApi = {
  reportIssue: async (issueData: CreateWaterIssueData): Promise<WaterIssue> => {
    const { data } = await api.post('/water/water/issues', issueData);
    return data.issue || data;
  },

  getIssues: async (status?: string): Promise<WaterIssue[]> => {
    const { data } = await api.get('/water/water/issues', {
      params: { status },
    });
    return data;
  },

  updateIssueStatus: async (id: number, updateData: UpdateWaterIssueData): Promise<WaterIssue> => {
    const { data } = await api.patch(`/water/water/issues/${id}`, updateData);
    return data;
  },
};

// ==================== NETWORK API ====================
export const networkApi = {
  reportIssue: async (issueData: CreateNetworkIssueData): Promise<NetworkIssue> => {
    const { data } = await api.post('/network/issues', issueData);
    return data.issue || data;
  },

  getIssues: async (status?: string, type?: string): Promise<NetworkIssue[]> => {
    const { data } = await api.get('/network/issues', {
      params: { status, type },
    });
    return data;
  },

  updateIssueStatus: async (id: number, updateData: UpdateNetworkIssueData): Promise<NetworkIssue> => {
    const { data } = await api.patch(`/network/issues/${id}`, updateData);
    return data;
  },

  addComment: async (issueId: number, content: string): Promise<NetworkComment> => {
    const { data } = await api.post(`/network/issues/${issueId}/comments`, { content });
    return data;
  },

  getComments: async (issueId: number): Promise<NetworkComment[]> => {
    const { data } = await api.get(`/network/issues/${issueId}/comments`);
    return data;
  },
};

// ==================== CLEANING API ====================
export const cleaningApi = {
  createRequest: async (requestData: CreateCleaningRequestData): Promise<CleaningRequest> => {
    const { data } = await api.post('/cleaning/requests', requestData);
    return data.data || data;
  },

  getMyRequests: async (status?: string): Promise<CleaningRequest[]> => {
    const { data } = await api.get('/cleaning/my-requests', {
      params: { status },
    });
    return data;
  },

  getAllRequests: async (params?: {
    status?: string;
    cleanerId?: number;
    building?: string;
  }): Promise<CleaningRequest[]> => {
    const { data } = await api.get('/cleaning/requests', { params });
    return data;
  },

  updateRequestStatus: async (
    id: number,
    updateData: UpdateCleaningRequestData
  ): Promise<CleaningRequest> => {
    const { data } = await api.patch(`/cleaning/requests/${id}/status`, updateData);
    return data.data || data;
  },

  submitFeedback: async (
    id: number,
    feedbackData: SubmitCleaningFeedbackData
  ): Promise<CleaningRequest> => {
    const { data } = await api.post(`/cleaning/requests/${id}/feedback`, feedbackData);
    return data.data || data;
  },

  getCleaners: async (): Promise<User[]> => {
    const { data } = await api.get('/cleaning/cleaners');
    return data.data || data;
  },
};

// ==================== ADMIN API ====================
export const adminApi = {
  getUsers: async (params?: PaginationParams & {
    role?: string;
    search?: string;
  }): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  getUsersByRole: async (role: string, params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get(`/admin/users/role/${role}`, { params });
    return data;
  },

  getUser: async (id: number): Promise<User> => {
    const { data } = await api.get(`/admin/users/${id}`);
    return data.data || data;
  },

  createUser: async (userData: RegisterData): Promise<User> => {
    const { data } = await api.post('/admin/users', userData);
    return data.data || data;
  },

  updateUser: async (id: number, userData: Partial<RegisterData>): Promise<User> => {
    const { data } = await api.put(`/admin/users/${id}`, userData);
    return data.data || data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  getStats: async (): Promise<any> => {
    const { data } = await api.get('/admin/stats');
    return data;
  },
};

export default {
  auth: authApi,
  mess: messApi,
  transport: transportApi,
  water: waterApi,
  network: networkApi,
  cleaning: cleaningApi,
  admin: adminApi,
};
