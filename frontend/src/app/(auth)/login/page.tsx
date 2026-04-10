// frontend/src/app/(auth)/login/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const schema = z.object({
  email:         z.string().email('Invalid email'),
  password:      z.string().min(1, 'Password required'),
  twoFactorCode: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPass, setShowPass]       = useState(false);
  const [needs2FA, setNeeds2FA]       = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password, data.twoFactorCode);
      toast.success('Welcome back!');
      router.push('/');
    } catch (err: any) {
      if (err?.requiresTwoFactor) { setNeeds2FA(true); return; }
      toast.error(err?.message || 'Login failed');
    }
  };

  const handleOAuth = (provider: 'google' | 'facebook') => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl mx-auto mb-4">M</div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => handleOAuth('google')}
              className="flex items-center justify-center gap-2 py-2.5 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors text-sm">
              <span>🇬</span> Google
            </button>
            <button onClick={() => handleOAuth('facebook')}
              className="flex items-center justify-center gap-2 py-2.5 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors text-sm">
              <span>🇫</span> Facebook
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-xs text-gray-500">or continue with email</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-11 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* 2FA */}
            {needs2FA && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Two-Factor Code</label>
                <input
                  {...register('twoFactorCode')}
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm text-center tracking-widest
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold
                py-3 rounded-xl transition-all flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {needs2FA ? 'Verify & Sign In' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
