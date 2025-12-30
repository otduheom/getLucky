import React from 'react';
import { Outlet } from 'react-router';
import Header from './ui/Header';
import styles from './Layout.module.css';

interface LayoutProps {
  user: {
    status: 'logging' | 'logged' | 'guest';
    data: {
      name: string;
      email: string;
    } | null;
  };
  setUser: (user: LayoutProps['user']) => void;
}

function Layout({ user, setUser }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Header user={user} setUser={setUser} />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;

