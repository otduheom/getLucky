import { Outlet } from 'react-router';
import { ToastContainer } from 'react-toastify';
import Header from './ui/Header';
import styles from './Layout.module.css';


function Layout() {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.content}>
        <Outlet />
      </div>
      <ToastContainer />
    </div>
  );
}

export default Layout;

