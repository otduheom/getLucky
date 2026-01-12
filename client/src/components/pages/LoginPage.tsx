import { FormEvent } from 'react';
import styles from './LoginPage.module.css';
import UserValidate from '../../entities/user/UserValidate';
import { useNavigate } from 'react-router';
import { showToast } from '../../shared/lib/toast';
import { useLoginMutation } from '../../features/auth/authApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const [login, {isLoading}] = useLoginMutation();
  
  const loginHandler = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.currentTarget));
      const { isValid, error } = UserValidate.validateLoginData(formData as { email: string; password: string });

      if (!isValid) return showToast.error(error);

      await login(formData as { email: string; password: string }).unwrap();
      navigate('/');
    } catch (error: any) {
      console.log(error);
      showToast.error(error.data?.message || 'Ошибка входа');
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
        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Вход...' : 'Подтвердить'}
        </button>
      </form>
    </div>
  );
}

