import { useMemo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';
import ErrorPage from './components/pages/ErrorPage';
import MainPage from './components/pages/MainPage';
import Layout from './components/Layout';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import ProtectedRoute from './components/HOCs/ProtectedRoute';
import ProfilePage from './components/pages/ProfilePage';
import FriendsPage from './components/pages/FriendsPage';
import ChatsPage from './components/pages/ChatsPage';
import ChatPage from './components/pages/ChatPage';
import CreateGroupPage from './components/pages/CreateGroupPage';
import GroupChatPage from './components/pages/GroupChatPage';
import { useAppSelector } from './app/hooks';
import { useRefreshTokensQuery } from './features/auth/authApi';

function App() {
const auth = useAppSelector((state) => state.auth);

const  { isLoading } = useRefreshTokensQuery(undefined, {
  skip: auth.status !== 'logging',
});

  const router = useMemo(() => {
    const isGuest = auth.status === 'guest';
    return createBrowserRouter([
      {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: '/',
            element: <MainPage />,
          },
          {
            path: '/profile/:userId?',
            element: (
              <ProtectedRoute isAllowed={!isGuest} redirectTo="/login">
                <ProfilePage />
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
                <ChatPage />
              </ProtectedRoute>
            ),
          },
          {
            path: '/groups/create',
            element: (
              <ProtectedRoute isAllowed={!isGuest} redirectTo="/login">
                <CreateGroupPage />
              </ProtectedRoute>
            ),
          },
          {
            path: '/chat/group/:groupId',
            element: (
              <ProtectedRoute isAllowed={!isGuest} redirectTo="/login">
                <GroupChatPage />
              </ProtectedRoute>
            ),
          },
          {
            path: '/signup',
            element: (
              <ProtectedRoute isAllowed={isGuest} redirectTo="/">
                <SignUpPage />
              </ProtectedRoute>
            ),
          },
          {
            path: '/login',
            element: (
              <ProtectedRoute isAllowed={isGuest} redirectTo="/">
                <LoginPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ]);
  }, [auth.status]);

  if (auth.status === 'logging') {
    return null;
  }
  return <RouterProvider router={router} />;
}

export default App;
