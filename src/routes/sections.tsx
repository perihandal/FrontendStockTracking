import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { ProtectedRoute } from 'src/components/protected-route';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const StockCardsPage = lazy(() => import('src/pages/stock-cards'));
export const StockTransactionsPage = lazy(() => import('src/pages/stock-transactions'));
export const CompaniesPage = lazy(() => import('src/pages/companies'));
export const BranchesPage = lazy(() => import('src/pages/branches'));
export const WarehousesPage = lazy(() => import('src/pages/warehouses'));
export const BarcodesPage = lazy(() => import('src/pages/barcodes'));
export const CategoriesPage = lazy(() => import('src/pages/categories'));
export const GroupsPage = lazy(() => import('src/pages/groups'));
export const PricesPage = lazy(() => import('src/pages/prices'));
export const UsersPage = lazy(() => import('src/pages/users'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'stock-cards', element: <StockCardsPage /> },
      { path: 'stock-transactions', element: <StockTransactionsPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'branches', element: <BranchesPage /> },
      { path: 'warehouses', element: <WarehousesPage /> },
      { path: 'barcodes', element: <BarcodesPage /> },
      { path: 'categories', element: <CategoriesPage /> },
        { path: 'groups', element: <GroupsPage /> },
        { path: 'prices', element: <PricesPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'user', element: <UserPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'blog', element: <BlogPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'sign-up',
    element: (
      <AuthLayout>
        <SignUpPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
