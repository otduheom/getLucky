import React, { useState, useEffect, useMemo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import ErrorPage from './components/pages/ErrorPage';
import MainPage from './components/pages/MainPage';
import Layout from './components/Layout';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import axiosInstance, { setAccessToken } from './shared/lib/axiosInstance';
import ProtectedRoute from './components/HOCs/ProtectedRoute';

interface User {
  status: 'logging' | 'logged' | 'guest';
  data: {
    name: string;
    email: string;
  } | null;
}

function App() {
  const [user, setUser] = useState<User>({ status: 'logging', data: null });

  useEffect(() => {
    axiosInstance('/auth/refreshTokens')
      .then((res) => {
        setUser({ status: 'logged', data: res.data.user });
        setAccessToken(res.data.accessToken);
      })
      .catch(() => {
        setUser({ status: 'guest', data: null });
        setAccessToken('');
      });
  }, []);

  const router = useMemo(() => {
    const isGuest = user?.status === 'guest';
    return createBrowserRouter([
      {
        path: '/',
        element: <Layout user={user} setUser={setUser} />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: '/',
            element: <MainPage user={user} />,
          },
          {
            path: '/signup',
            element: (
              <ProtectedRoute isAllowed={isGuest} redirectTo="/">
                <SignUpPage setUser={setUser} />
              </ProtectedRoute>
            ),
          },
          {
            path: '/login',
            element: (
              <ProtectedRoute isAllowed={isGuest} redirectTo="/">
                <LoginPage setUser={setUser} />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ]);
  }, [user]);

  if (user?.status === 'logging') {
    return null;
  }
  return <RouterProvider router={router} />;
}

export default App;
