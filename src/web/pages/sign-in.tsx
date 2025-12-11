import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { FaGoogle as GoogleIcon } from 'react-icons/fa';
import { authClient } from '../lib/auth';

interface SignInForm {
  email: string;
  password: string;
}

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignInForm>();

  const onSubmit = async (data: SignInForm) => {
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError('root', { message: error.message || 'Sign in failed' });
      return;
    }

    setLocation('/');
  };

  return (
    <div>
      <h2>Sign In</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.root && <div>{errors.root.message}</div>}

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email', { required: true })} />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register('password', { required: true })} />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <div>
          <button type="button" onClick={() => authClient.signIn.social({ provider: 'google' })}>
            <GoogleIcon /> Sign in with Google
          </button>
        </div>

        <div>
          <a href="/sign-up">Don't have an account? Sign up</a>
        </div>
      </form>
    </div>
  );
}
