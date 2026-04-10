// frontend/src/app/(auth)/register/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const schema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Invalid email'),
  password:        z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirmPassword: z.string(),
  referralCode:    z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const passwordRequirements = [
  { label: 'At least 8 characters',      test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter',        test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One number',                  test: (v: string) => /[0-9]/.test(v) },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { referralCode: searchParams.get('ref') || '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created! Welcome aboard 🎉');
      router.push('/');
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed');
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
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-1">Join thousands of buyers and sellers</p>
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
            <span className="text-xs text-gray-500">or fill in the form</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
              <input {...register('name')} type="text" placeholder="John Doe"
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com"
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map(req => (
                    <div key={req.label} className={`flex items-center gap-2 text-xs
                      ${req.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                      <Check className="w-3 h-3" />
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Confirm Password</label>
              <input {...register('confirmPassword')} type={showPass ? 'text' : 'password'}
                placeholder="Repeat your password"
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Referral Code <span className="text-gray-600">(optional)</span></label>
              <input {...register('referralCode')} type="text" placeholder="Enter referral code"
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 uppercase" />
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold
                py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-4">
            By signing up you agree to our{' '}
            <Link href="/terms" className="text-blue-400">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-400">Privacy Policy</Link>
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
