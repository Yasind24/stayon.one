import React, { useEffect } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';
import { useAuth } from '../lib/auth';

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="mb-8 text-center">
          <Logo />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Stayon.one
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in or create an account to get started
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#4338ca',
                  },
                },
              },
            }}
            providers={['google']}
          />
        </div>
      </div>
    </div>
  );
}