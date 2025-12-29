import { FormEvent } from 'react';
import styles from './LoginPage.module.css';
import UserApi from '../../entities/user/UserApi';
import UserValidate from '../../entities/user/UserValidate';
import { useNavigate } from 'react-router';
import { setAccessToken } from '../../shared/lib/axiosInstance';

interface LoginPageProps {
  setUser: (user: {
    status: 'logging' | 'logged' | 'guest';
    data: {
      name: string;
      email: string;
    } | null;
  }) => void;
}

export default function LoginPage({ setUser }: LoginPageProps) {
  const navigate = useNavigate();
  const loginHandler = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.currentTarget));
      const { isValid, error } = UserValidate.validateLoginData(formData as { email: string; password: string });
      if (!isValid) return alert(error);
      const res = await UserApi.login(formData as { email: string; password: string });
      setUser({ status: 'logged', data: res.data.user });
      setAccessToken(res.data.accessToken);
      navigate('/');
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data?.message);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={loginHandler}>
        <div className={styles.inputGroup}>
          <div className={styles.inputLabel}>Email</div>
          <input className={styles.input} name="email" type="email" required />
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.inputLabel}>Password</div>
          <input className={styles.input} name="password" type="password" required />
        </div>
        <button type="submit" className={styles.submitButton}>
          Подтвердить
        </button>
      </form>
    </div>
  );
}

