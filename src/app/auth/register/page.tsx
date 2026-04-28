'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm }   from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z }          from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast }      from 'sonner';
import { authApi, extractApiError } from '@/lib/api/client';
import { useAuthStore }             from '@/lib/store';
import type { RegisterForm }        from '@/types';

const schema = z.object({
  first_name: z.string().min(1, 'Requis').max(100),
  last_name:  z.string().min(1, 'Requis').max(100),
  email:      z.string().email('Email invalide'),
  password:   z.string().min(8, '8 caractères minimum'),
  phone:      z.string().optional(),
});

export default function RegisterPage() {
  const router       = useRouter();
  const { setUser }  = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setUser(res.user, res.access_token, res.refresh_token);
      toast.success('Compte créé ! Bienvenue sur Vision R+.');
      router.push('/companies');
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-navy
                          rounded-2xl mb-4 shadow-card">
            <span className="text-2xl font-black text-white tracking-tighter">R+</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Créer un compte</h1>
          <p className="text-slate-500 text-sm mt-1">Vision R+ · Gestion financière</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prénom</label>
                <input {...register('first_name')} placeholder="Arnaud" className="input" />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label className="label">Nom</label>
                <input {...register('last_name')} placeholder="Moussounda" className="input" />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="vous@exemple.com"
                className="input"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Téléphone (optionnel)</label>
              <input {...register('phone')} type="tel" placeholder="+33 6 00 00 00 00" className="input" />
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="8 caractères minimum"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Création en cours…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">déjà inscrit ?</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <button
            onClick={() => router.push('/auth/login')}
            className="btn-secondary w-full justify-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
