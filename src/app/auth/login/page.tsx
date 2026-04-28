'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm }   from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z }          from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { toast }      from 'sonner';
import { authApi, extractApiError } from '@/lib/api/client';
import { useAuthStore }             from '@/lib/store';
import type { LoginForm }           from '@/types';

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(8, '8 caractères minimum'),
});

export default function LoginPage() {
  const router          = useRouter();
  const { setUser }     = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      setUser(res.user, res.access_token, res.refresh_token);
      toast.success(`Bienvenue, ${res.user.first_name} !`);
      router.push('/dashboard');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Logo ───────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-navy
                          rounded-2xl mb-4 shadow-card">
            <span className="text-2xl font-black text-white tracking-tighter">R+</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Vision R+</h1>
          <p className="text-slate-500 text-sm mt-1">Gestion financière &amp; comptable</p>
        </div>

        {/* ── Carte formulaire ───────────────────────────── */}
        <div className="card p-8">
          <h2 className="text-lg font-bold text-brand-navy mb-1">Connexion</h2>
          <p className="text-slate-400 text-sm mb-6">
            Accédez à votre espace de gestion
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
              <label className="label">Adresse email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="vous@exemple.com"
                autoComplete="email"
                className="input"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                             hover:text-slate-600 transition-colors"
                >
                  {showPwd
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye    className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <ArrowRight className="w-4 h-4" />
              }
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">ou</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Lien inscription */}
          <p className="text-center text-sm text-slate-500">
            Pas encore de compte ?{' '}
            <button
              onClick={() => router.push('/auth/register')}
              className="text-brand-orange font-semibold hover:underline"
            >
              Créer un compte
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          OHADA · PCG France · SaaS Comptable
        </p>
      </div>
    </div>
  );
}
