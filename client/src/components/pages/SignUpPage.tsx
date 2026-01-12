import { FormEvent } from 'react';
import styles from './SignUpPage.module.css';
import UserValidate from '../../entities/user/UserValidate';
import { useNavigate } from 'react-router';
import { showToast } from '../../shared/lib/toast';
import { useSignupMutation } from '../../features/auth/authApi';



export default function SignUpPage() {
  const navigate = useNavigate();
  const [signup, {isLoading}] = useSignupMutation();

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

      if (!isValid) return showToast.error(error);

     await signup(formData as { name: string; email: string; password: string;}).unwrap();
      navigate('/');
    } catch (error: any) {
      console.log(error);
      showToast.error(error.data?.message || 'Ошибка регистрации');
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
        <button type="submit" disabled={isLoading} className={styles.submitButton}>
          {isLoading ? 'Регистрация...' : 'Подтвердить'}
        </button>
      </form>
    </div>
  );
}

