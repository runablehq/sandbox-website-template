import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { FaGoogle as GoogleIcon } from 'react-icons/fa';
import { authClient } from '../lib/auth';

interface SignUpForm {
  name: string;
  email: string;
  password: string;
}

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignUpForm>();

  const onSubmit = async (data: SignUpForm) => {
    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError('root', { message: error.message || 'Sign up failed' });
      return;
    }

    setLocation('/');
  };

  return (
    <div>
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.root && <div>{errors.root.message}</div>}

        <div>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" {...register('name', { required: true })} />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email', { required: true })} />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register('password', { required: true })} />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing up...' : 'Sign Up'}
        </button>

        <div>
          <button type="button" onClick={() => authClient.signIn.social({ provider: 'google' })}>
            <GoogleIcon /> Sign up with Google
          </button>
        </div>

        <div>
          <a href="/sign-in">Already have an account? Sign in</a>
        </div>
      </form>
    </div>
  );
}
