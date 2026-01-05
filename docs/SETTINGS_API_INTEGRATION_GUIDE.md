# 🎯 Settings API Integration Guide

## 📋 API Overview

The Settings API provides endpoints to manage turnover configuration settings. It includes both public and private routes for different use cases.

## 🔗 API Endpoints

### Public Routes (No Authentication Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/settings/current` | Get current settings |
| `GET` | `/api/settings/default-turnover` | Get default turnover value |

### Private Routes (Authentication Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/settings` | Get all settings |
| `GET` | `/api/settings/:id` | Get settings by ID |
| `POST` | `/api/settings` | Create new settings |
| `PUT` | `/api/settings/:id` | Update settings by ID |
| `PUT` | `/api/settings/update-current` | Update current settings |
| `PUT` | `/api/settings/set-default-turnover` | Set default turnover |
| `DELETE` | `/api/settings/:id` | Delete settings |

## 🚀 Frontend Integration with React Query + Axios

### 1. Axios Instance Setup

```typescript
// src/lib/axios.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. API Service Functions

```typescript
// src/services/settingsService.ts
import { axiosInstance } from '../lib/axios';

export interface Settings {
  id: number;
  defaultTurnover: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettingsData {
  defaultTurnover: number;
}

export interface UpdateSettingsData {
  defaultTurnover: number;
}

export const settingsService = {
  // Public endpoints
  getCurrentSettings: () => 
    axiosInstance.get<{ status: boolean; data: Settings }>('/settings/current'),
    
  getDefaultTurnover: () => 
    axiosInstance.get<{ status: boolean; data: { defaultTurnover: number } }>('/settings/default-turnover'),

  // Private endpoints
  getAllSettings: () => 
    axiosInstance.get<{ status: boolean; data: Settings[] }>('/settings'),
    
  getSettingsById: (id: number) => 
    axiosInstance.get<{ status: boolean; data: Settings }>(`/settings/${id}`),
    
  createSettings: (data: CreateSettingsData) => 
    axiosInstance.post<{ status: boolean; data: any; message: string }>('/settings', data),
    
  updateSettings: (id: number, data: UpdateSettingsData) => 
    axiosInstance.put<{ status: boolean; data: any; message: string }>(`/settings/${id}`, data),
    
  updateCurrentSettings: (data: UpdateSettingsData) => 
    axiosInstance.put<{ status: boolean; data: any; message: string }>('/settings/update-current', data),
    
  setDefaultTurnover: (defaultTurnover: number) => 
    axiosInstance.put<{ status: boolean; data: any; message: string }>('/settings/set-default-turnover', { defaultTurnover }),
    
  deleteSettings: (id: number) => 
    axiosInstance.delete<{ status: boolean; data: any; message: string }>(`/settings/${id}`),
};
```

### 3. React Query Hooks

```typescript
// src/hooks/useSettings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, type CreateSettingsData, type UpdateSettingsData } from '../services/settingsService';
import { toast } from 'react-hot-toast'; // or your preferred toast library

export const useSettings = () => {
  const queryClient = useQueryClient();

  // Query keys
  const settingsKeys = {
    all: ['settings'] as const,
    current: () => [...settingsKeys.all, 'current'] as const,
    defaultTurnover: () => [...settingsKeys.all, 'defaultTurnover'] as const,
    byId: (id: number) => [...settingsKeys.all, 'byId', id] as const,
  };

  // Queries
  const useCurrentSettings = () => useQuery({
    queryKey: settingsKeys.current(),
    queryFn: settingsService.getCurrentSettings,
    select: (response) => response.data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const useDefaultTurnover = () => useQuery({
    queryKey: settingsKeys.defaultTurnover(),
    queryFn: settingsService.getDefaultTurnover,
    select: (response) => response.data.data.defaultTurnover,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const useAllSettings = () => useQuery({
    queryKey: settingsKeys.all,
    queryFn: settingsService.getAllSettings,
    select: (response) => response.data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const useSettingsById = (id: number) => useQuery({
    queryKey: settingsKeys.byId(id),
    queryFn: () => settingsService.getSettingsById(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });

  // Mutations
  const useCreateSettings = () => useMutation({
    mutationFn: settingsService.createSettings,
    onSuccess: (response) => {
      toast.success(response.data.message || 'Settings created successfully');
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create settings');
    },
  });

  const useUpdateSettings = () => useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSettingsData }) =>
      settingsService.updateSettings(id, data),
    onSuccess: (response, variables) => {
      toast.success(response.data.message || 'Settings updated successfully');
      queryClient.invalidateQueries({ queryKey: settingsKeys.byId(variables.id) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });

  const useUpdateCurrentSettings = () => useMutation({
    mutationFn: settingsService.updateCurrentSettings,
    onSuccess: (response) => {
      toast.success(response.data.message || 'Settings updated successfully');
      queryClient.invalidateQueries({ queryKey: settingsKeys.current() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });

  const useSetDefaultTurnover = () => useMutation({
    mutationFn: settingsService.setDefaultTurnover,
    onSuccess: (response) => {
      toast.success(response.data.message || 'Default turnover updated successfully');
      queryClient.invalidateQueries({ queryKey: settingsKeys.defaultTurnover() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.current() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update default turnover');
    },
  });

  const useDeleteSettings = () => useMutation({
    mutationFn: settingsService.deleteSettings,
    onSuccess: (response) => {
      toast.success(response.data.message || 'Settings deleted successfully');
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete settings');
    },
  });

  return {
    // Queries
    useCurrentSettings,
    useDefaultTurnover,
    useAllSettings,
    useSettingsById,
    // Mutations
    useCreateSettings,
    useUpdateSettings,
    useUpdateCurrentSettings,
    useSetDefaultTurnover,
    useDeleteSettings,
  };
};
```

### 4. React Components Usage

```typescript
// src/components/SettingsForm.tsx
import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';

export const SettingsForm: React.FC = () => {
  const [defaultTurnover, setDefaultTurnover] = useState<number>(0);
  const { useCurrentSettings, useUpdateCurrentSettings } = useSettings();

  const { data: currentSettings, isLoading } = useCurrentSettings();
  const updateSettingsMutation = useUpdateCurrentSettings();

  React.useEffect(() => {
    if (currentSettings) {
      setDefaultTurnover(currentSettings.defaultTurnover);
    }
  }, [currentSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({ defaultTurnover });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="defaultTurnover" className="block text-sm font-medium">
          Default Turnover
        </label>
        <input
          type="number"
          id="defaultTurnover"
          value={defaultTurnover}
          onChange={(e) => setDefaultTurnover(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={updateSettingsMutation.isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {updateSettingsMutation.isPending ? 'Updating...' : 'Update Settings'}
      </button>
    </form>
  );
};
```

```typescript
// src/components/DefaultTurnoverDisplay.tsx
import React from 'react';
import { useSettings } from '../hooks/useSettings';

export const DefaultTurnoverDisplay: React.FC = () => {
  const { useDefaultTurnover } = useSettings();
  const { data: defaultTurnover, isLoading, error } = useDefaultTurnover();

  if (isLoading) return <div>Loading default turnover...</div>;
  if (error) return <div>Error loading default turnover</div>;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Default Turnover</h3>
      <p className="text-2xl font-bold text-blue-600">
        {defaultTurnover?.toLocaleString() || 0}
      </p>
    </div>
  );
};
```

```typescript
// src/components/SettingsList.tsx
import React from 'react';
import { useSettings } from '../hooks/useSettings';

export const SettingsList: React.FC = () => {
  const { useAllSettings, useDeleteSettings } = useSettings();
  const { data: settings, isLoading } = useAllSettings();
  const deleteSettingsMutation = useDeleteSettings();

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this setting?')) {
      deleteSettingsMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">All Settings</h2>
      {settings?.map((setting) => (
        <div key={setting.id} className="p-4 border rounded-lg flex justify-between items-center">
          <div>
            <p className="font-medium">ID: {setting.id}</p>
            <p>Default Turnover: {setting.defaultTurnover.toLocaleString()}</p>
            <p className="text-sm text-gray-500">
              Updated: {new Date(setting.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => handleDelete(setting.id)}
            disabled={deleteSettingsMutation.isPending}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 5. App Setup with React Query

```typescript
// src/App.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SettingsForm } from './components/SettingsForm';
import { DefaultTurnoverDisplay } from './components/DefaultTurnoverDisplay';
import { SettingsList } from './components/SettingsList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Settings Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Update Settings</h2>
            <SettingsForm />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Current Settings</h2>
            <DefaultTurnoverDisplay />
          </div>
        </div>
        
        <div className="mt-8">
          <SettingsList />
        </div>
      </div>
      
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

## 📦 Installation Requirements

```bash
npm install @tanstack/react-query axios react-hot-toast
# or
yarn add @tanstack/react-query axios react-hot-toast
```

## 🔧 Environment Variables

```env
REACT_APP_API_URL=http://localhost:3000/api
```

## 🎨 Styling

This guide uses Tailwind CSS classes. If you're using a different styling solution, replace the className attributes accordingly.

## 🚀 Key Features

- ✅ **Real-time Updates**: Automatic cache invalidation and refetching
- ✅ **Error Handling**: Comprehensive error handling with user feedback
- ✅ **Loading States**: Proper loading and pending states
- ✅ **Optimistic Updates**: Immediate UI updates with rollback on error
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Authentication**: Automatic token handling and 401 redirects
- ✅ **Toast Notifications**: User feedback for all operations

## 🔒 Security Notes

- Private routes require valid JWT tokens
- Tokens are automatically added to requests
- Unauthorized requests redirect to login
- All sensitive operations are protected

## 📱 Mobile Considerations

- Responsive design with Tailwind CSS
- Touch-friendly form controls
- Optimized for mobile performance

This integration provides a robust, type-safe, and user-friendly way to manage turnover settings with React Query and Axios!
