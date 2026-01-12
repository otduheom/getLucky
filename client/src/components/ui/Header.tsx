import { NavLink, useNavigate } from 'react-router';
import styles from './Header.module.css';
import { useLogoutMutation } from '../../features/auth/authApi';
import { useAppSelector } from '../../app/hooks';

function Header() {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const auth = useAppSelector((state) => state.auth);

  const logoutHandler = async () => {
    try {
      await logout().unwrap();
      navigate('/');
    } catch (error) {
      console.log(error);
      navigate('/');
    }
  };

  return (
    <header role="banner" className={styles.header}>
      <div className={styles.navContainer}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                Главная
              </NavLink>
            </li>
            {auth.status === 'logged' ? (
              <>
                <li>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    Профиль
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/friends"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    Друзья
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/chats"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    Чаты
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    className={styles.userName}
                  >
                    {auth.user?.name}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/"
                    onClick={logoutHandler}
                    className={styles.navLink}
                  >
                    Выйти
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/signup"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    Регистрация
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  >
                    Вход
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;

