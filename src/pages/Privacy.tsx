import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </button>
          <Logo />
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-sm sm:text-base text-gray-600">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Introduction</h2>
              <p>
                At Stayon.one, we take your privacy seriously. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            {/* Rest of the content remains the same */}
          </div>
        </div>
      </div>
    </div>
  );
}