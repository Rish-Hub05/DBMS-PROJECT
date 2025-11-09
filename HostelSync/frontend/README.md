# HostelSync Frontend

A modern, production-ready React TypeScript frontend for the HostelSync Hostel Management System.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Mess Management**: View weekly menus, submit feedback
- **Transport Booking**: Book transport, view schedules, manage bookings
- **Issue Tracking**: Report and track water & network issues
- **Cleaning Services**: Request cleaning services with scheduling
- **User Management**: Admin panel for managing users (Admin only)
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: React Query for data fetching and caching
- **Form Validation**: Zod schemas with React Hook Form
- **Toast Notifications**: User-friendly feedback with react-hot-toast

## 📦 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v6** - Routing
- **TanStack Query (React Query)** - Data fetching & caching
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date utilities

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend server running on `http://localhost:5000`

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_ENV=development
   VITE_ENABLE_DEVTOOLS=true
   ```

5. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/           # Layout components (Sidebar, Header, etc.)
│   │   ├── ui/               # Reusable UI components
│   │   └── ProtectedRoute.tsx
│   ├── lib/
│   │   ├── axios.ts          # Axios instance with interceptors
│   │   ├── utils.ts          # Utility functions
│   │   └── validations.ts    # Zod validation schemas
│   ├── pages/
│   │   ├── auth/             # Login, Register
│   │   ├── mess/             # Mess menu pages
│   │   ├── transport/        # Transport booking pages
│   │   ├── water/            # Water issues pages
│   │   ├── network/          # Network issues pages
│   │   ├── cleaning/         # Cleaning services pages
│   │   ├── admin/            # Admin pages
│   │   └── Dashboard.tsx
│   ├── services/
│   │   └── api.ts            # API service layer
│   ├── store/
│   │   └── authStore.ts      # Zustand auth store
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── App.tsx               # Main app component with routing
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── public/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔐 Authentication Flow

1. User logs in with email/password
2. Backend returns JWT token and user data
3. Token stored in localStorage and Zustand store
4. Axios interceptor adds token to all requests
5. On 401 response, user is auto-logged out and redirected to login

## 🎨 UI Components

All UI components are built from scratch with Tailwind CSS:

- **Button** - Multiple variants (primary, secondary, danger, ghost, outline)
- **Input** - Text input with label, error, and helper text
- **Select** - Dropdown select with validation
- **Textarea** - Multi-line text input
- **Modal** - Accessible modal dialog
- **Card** - Container with header, content, footer
- **Badge** - Status badges with variants
- **Table** - Data table with header, body, rows
- **Alert** - Alert messages (info, success, warning, error)
- **LoadingSpinner** - Loading states
- **EmptyState** - Empty state placeholders

## 🔄 Data Fetching

React Query is used for all API calls with:

- **Automatic caching** - 5-minute stale time
- **Background refetching** - Keep data fresh
- **Optimistic updates** - Instant UI feedback
- **Error handling** - Global error boundaries
- **Loading states** - Built-in loading indicators

Example:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['mess-menu'],
  queryFn: messApi.getWeeklyMenu,
});
```

## 📝 Form Validation

Zod schemas ensure type-safe validation:

```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
```

React Hook Form integrates with Zod:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

## 🎯 Role-Based Access Control

Routes are protected based on user roles:

```typescript
<ProtectedRoute allowedRoles={['ADMIN']}>
  <UserManagementPage />
</ProtectedRoute>
```

Available roles:
- **STUDENT** - Access to booking and reporting features
- **ADMIN** - Full system access including user management
- **STAFF** - Mess menu management
- **CLEANER** - View and update cleaning requests
- **PLUMBER** - Manage water issues
- **IT_STAFF** - Manage network issues
- **WARDEN** - Hostel oversight

## 🌐 API Integration

All API calls are centralized in `src/services/api.ts`:

```typescript
// Example API call
const { data } = await messApi.getWeeklyMenu();
const booking = await transportApi.createBooking({ scheduleId, bookingDate });
```

API endpoints match the backend structure:
- `/api/auth` - Authentication
- `/api/mess` - Mess management
- `/api/transport` - Transport booking
- `/api/water/water` - Water issues
- `/api/network` - Network issues
- `/api/cleaning` - Cleaning services
- `/api/admin` - User management

## 🎨 Styling

Tailwind CSS utility classes are used throughout:

```typescript
<button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
  Click Me
</button>
```

Custom color palette defined in `tailwind.config.js`:
- Primary: Blue shades (50-950)
- Status colors: Green (success), Yellow (warning), Red (danger)

## 🧪 Development Tips

1. **React Query DevTools**: Enable in `.env` with `VITE_ENABLE_DEVTOOLS=true`
2. **Type Safety**: All API responses are typed
3. **Error Handling**: Axios interceptors handle global errors
4. **Hot Reload**: Vite provides instant HMR
5. **Path Aliases**: Use `@/` for imports (e.g., `@/components/ui/Button`)

## 📱 Responsive Design

The app is fully responsive:
- **Mobile**: Hamburger menu, stacked layouts
- **Tablet**: Optimized grid layouts
- **Desktop**: Full sidebar navigation

## 🔧 Troubleshooting

### Port already in use
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3001
```

### API connection issues
- Ensure backend is running on `http://localhost:5000`
- Check CORS settings in backend
- Verify `VITE_API_BASE_URL` in `.env`

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is part of the HostelSync system.

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use existing UI components
3. Add proper error handling
4. Write meaningful commit messages
5. Test on multiple screen sizes

## 📞 Support

For issues or questions, please contact the development team.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
