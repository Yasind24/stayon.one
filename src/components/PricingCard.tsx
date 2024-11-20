import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PricingCardProps {
  tier: string;
  price: string;
  yearlyPrice?: string;
  features: string[];
  isPopular?: boolean;
  isOneTime?: boolean; // Added new prop
}

export function PricingCard({ 
  tier, 
  price, 
  yearlyPrice, 
  features, 
  isPopular,
  isOneTime = false // Default to false
}: PricingCardProps) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const getButtonText = () => {
    switch (tier.toLowerCase()) {
      case 'free': return 'Start Free Trial';
      case 'pro': return 'Go Pro Now';
      case 'creator': return 'Launch Creator Plan';
      default: return 'Get Started';
    }
  };

  return (
    <div className={`bg-white p-8 rounded-2xl shadow-lg border ${
      isPopular ? 'border-indigo-500 scale-105' : 'border-gray-100'
    } hover:border-indigo-500 transition-all duration-300 flex flex-col h-full relative`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-4">{tier}</h3>
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold">{price}</span>
          {isOneTime && (
            <span className="text-gray-600 ml-2 text-sm">one-time</span>
          )}
        </div>
        {yearlyPrice && !isOneTime && (
          <p className="text-gray-600 mt-1">or {yearlyPrice}</p>
        )}
      </div>
      <ul className="space-y-3 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span className="leading-tight">{feature}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={handleGetStarted}
        className={`mt-8 w-full py-3 px-6 rounded-lg font-medium transition-colors ${
          isPopular 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
            : 'bg-gray-50 text-indigo-600 hover:bg-gray-100'
        }`}
      >
        {getButtonText()}
      </button>
    </div>
  );
}