import React, { useState, useEffect, useMemo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import ErrorPage from './components/pages/ErrorPage';
import MainPage from './components/pages/MainPage';
import Layout from './components/Layout';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import axiosInstance, { setAccessToken } from './shared/lib/axiosInstance';
import ProtectedRoute from './components/HOCs/ProtectedRoute';
import ProfilePage from './components/pages/ProfilePage';
import FriendsPage from './components/pages/FriendsPage';
import ChatsPage from './components/pages/ChatsPage';
import ChatPage from './components/pages/ChatPage';


interface User {
  status: 'logging' | 'logged' | 'guest';
  data: {
    id: number;  // Добавить id
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
            path: '/profile/:userId?',
            element: (
              <ProtectedRoute isAllowed={!isGuest} redirectTo="/login">
                <ProfilePage currentUserId={user?.data?.id} />
              </ProtectedRoute>
            ),
          },
          {
            path: '/friends',
            element: (
              <ProtectedRoute isAllowed={!isGuest} redirectTo="/login">
                <FriendsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: '/chats',
            element: (
              <ProtectedRoute isAllowed={!isGuest} redirectTo="/login">
                <ChatsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: '/chat/:friendId',
            element: (
              <ProtectedRoute isAllowed={!isGuest} redirectTo="/login">
                <ChatPage currentUserId={user?.data?.id} />
              </ProtectedRoute>
            ),
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
