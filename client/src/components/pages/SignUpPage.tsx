import { FormEvent } from 'react';
import styles from './SignUpPage.module.css';
import UserApi from '../../entities/user/UserApi';
import UserValidate from '../../entities/user/UserValidate';
import { useNavigate } from 'react-router';
import { setAccessToken } from '../../shared/lib/axiosInstance';

interface SignUpPageProps {
  setUser: (user: {
    status: 'logging' | 'logged' | 'guest';
    data: {
      name: string;
      email: string;
    } | null;
  }) => void;
}

export default function SignUpPage({ setUser }: SignUpPageProps) {
  const navigate = useNavigate();
  const signUpHandler = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.currentTarget));
      const { isValid, error } = UserValidate.validateSignUpData(formData as {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
      });

      if (!isValid) return alert(error);

      const res = await UserApi.signup(formData as {
        name: string;
        email: string;
        password: string;
      });

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
      <form className={styles.form} onSubmit={signUpHandler}>
        <div className={styles.inputGroup}>
          <div className={styles.inputLabel}>Name</div>
          <input className={styles.input} name="name" type="text" required />
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.inputLabel}>Email</div>
          <input className={styles.input} name="email" type="email" required />
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.inputLabel}>Password</div>
          <input className={styles.input} name="password" type="password" required />
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.inputLabel}>Repeat Password</div>
          <input className={styles.input} name="confirmPassword" type="password" required />
        </div>
        <button type="submit" className={styles.submitButton}>
          Подтвердить
        </button>
      </form>
    </div>
  );
}

