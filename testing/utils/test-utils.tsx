/**
 * أدوات مساعدة مخصصة للاختبارات (Custom Test Utilities)
 * توفر دوال render مخصصة مع providers مختلفة للاختبارات
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { vi } from 'vitest';

// ============================================================================
// أنواع TypeScript
// ============================================================================

/**
 * خيارات مخصصة لـ render
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * تفعيل tRPC provider
   */
  withTRPC?: boolean;
  /**
   * تفعيل theme provider
   */
  withTheme?: boolean;
  /**
   * تفعيل query provider
   */
  withQuery?: boolean;
  /**
   * السمة المبدئية (light أو dark)
   */
  initialTheme?: 'light' | 'dark';
  /**
   * بيانات mock للمصادقة
   */
  authData?: {
    isAuthenticated: boolean;
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

// ============================================================================
// Query Client Mock
// ============================================================================

/**
 * إنشاء QueryClient للاختبارات
 */
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// ============================================================================
// tRPC Provider Mock
// ============================================================================

/**
 * Mock لـ tRPC Provider
 */
const MockTRPCProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// ============================================================================
// Theme Provider Mock
// ============================================================================

/**
 * Mock لـ Theme Provider
 */
const MockThemeProvider = ({
  children,
  initialTheme = 'light',
}: {
  children: React.ReactNode;
  initialTheme?: 'light' | 'dark';
}) => {
  return (
    <ThemeProvider attribute="class" defaultTheme={initialTheme} enableSystem={false}>
      {children}
    </ThemeProvider>
  );
};

// ============================================================================
// Query Provider Mock
// ============================================================================

/**
 * Mock لـ Query Provider
 */
const MockQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// ============================================================================
// Auth Provider Mock
// ============================================================================

/**
 * Mock لـ Auth Provider
 */
const MockAuthProvider = ({
  children,
  authData,
}: {
  children: React.ReactNode;
  authData?: {
    isAuthenticated: boolean;
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}) => {
  // Mock auth context
  const mockAuthContext = {
    isAuthenticated: authData?.isAuthenticated || false,
    user: authData?.user || null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
    isLoading: false,
  };

  return (
    <div data-testid="auth-provider" data-authenticated={mockAuthContext.isAuthenticated}>
      {children}
    </div>
  );
};

// ============================================================================
// Custom Render Functions
// ============================================================================

/**
 * دالة render مخصصة مع providers
 *
 * @example
 * ```tsx
 * renderWithProviders(<MyComponent />, { withTheme: true, withQuery: true })
 * ```
 */
export const renderWithProviders = (
  ui: ReactElement,
  {
    withTRPC = false,
    withTheme = false,
    withQuery = false,
    initialTheme = 'light',
    authData,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  // بناء شجرة الـ wrappers
  const wrappers: React.FC<{ children: React.ReactNode }>[] = [];

  // إضافة Auth Provider إذا كان هناك authData
  if (authData) {
    wrappers.push(({ children }) => (
      <MockAuthProvider authData={authData}>{children}</MockAuthProvider>
    ));
  }

  // إضافة tRPC Provider
  if (withTRPC) {
    wrappers.push(MockTRPCProvider);
  }

  // إضافة Query Provider
  if (withQuery) {
    wrappers.push(MockQueryProvider);
  }

  // إضافة Theme Provider
  if (withTheme) {
    wrappers.push(({ children }) => (
      <MockThemeProvider initialTheme={initialTheme}>{children}</MockThemeProvider>
    ));
  }

  // دمج جميع الـ wrappers
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <>
        {wrappers.reduceRight(
          (acc, Wrapper) => (
            <Wrapper>{acc}</Wrapper>
          ),
          children
        )}
      </>
    );
  };

  return {
    ...render(ui, { wrapper: AllProviders, ...renderOptions }),
  };
};

/**
 * دالة render مع tRPC provider فقط
 *
 * @example
 * ```tsx
 * renderWithTRPC(<MyComponent />)
 * ```
 */
export const renderWithTRPC = (
  ui: ReactElement,
  options?: Omit<CustomRenderOptions, 'withTRPC'>
) => {
  return renderWithProviders(ui, { ...options, withTRPC: true });
};

/**
 * دالة render مع theme provider فقط
 *
 * @example
 * ```tsx
 * renderWithTheme(<MyComponent />, { initialTheme: 'dark' })
 * ```
 */
export const renderWithTheme = (
  ui: ReactElement,
  options?: Omit<CustomRenderOptions, 'withTheme'>
) => {
  return renderWithProviders(ui, { ...options, withTheme: true });
};

/**
 * دالة render مع query provider فقط
 *
 * @example
 * ```tsx
 * renderWithQuery(<MyComponent />)
 * ```
 */
export const renderWithQuery = (
  ui: ReactElement,
  options?: Omit<CustomRenderOptions, 'withQuery'>
) => {
  return renderWithProviders(ui, { ...options, withQuery: true });
};

/**
 * دالة render مع mock authentication
 *
 * @example
 * ```tsx
 * renderWithAuth(<MyComponent />, {
 *   authData: {
 *     isAuthenticated: true,
 *     user: { id: '1', name: 'أحمد', email: 'ahmed@test.com', role: 'admin' }
 *   }
 * })
 * ```
 */
export const renderWithAuth = (
  ui: ReactElement,
  options?: Omit<CustomRenderOptions, 'authData'> & { authData: CustomRenderOptions['authData'] }
) => {
  return renderWithProviders(ui, { ...options, authData: options?.authData });
};

/**
 * دالة render مع router mock
 *
 * @example
 * ```tsx
 * renderWithRouter(<MyComponent />, { route: '/dashboard' })
 * ```
 */
export const renderWithRouter = (
  ui: ReactElement,
  { route = '/', ...renderOptions }: { route?: string } & Omit<CustomRenderOptions, never> = {}
) => {
  // Mock router location
  window.history.pushState({}, '', route);

  return render(ui, renderOptions);
};

/**
 * دالة render مع جميع الـ providers
 *
 * @example
 * ```tsx
 * renderWithAllProviders(<MyComponent />, {
 *   initialTheme: 'dark',
 *   authData: {
 *     isAuthenticated: true,
 *     user: { id: '1', name: 'أحمد', email: 'ahmed@test.com', role: 'admin' }
 *   }
 * })
 * ```
 */
export const renderWithAllProviders = (ui: ReactElement, options?: CustomRenderOptions) => {
  return renderWithProviders(ui, {
    ...options,
    withTRPC: true,
    withTheme: true,
    withQuery: true,
  });
};

// ============================================================================
// Re-export كل شيء من testing-library/react
// ============================================================================

export * from '@testing-library/react';
