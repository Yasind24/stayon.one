import React from 'react';
import { Calendar, BarChart3, Share2, Zap, Users, Cloud } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { FeatureCard } from './components/FeatureCard';
import { PricingCard } from './components/PricingCard';
import { NewsletterForm } from './components/NewsletterForm';

function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-indigo-50">
      <Navbar />
      
      {/* Hero Section */}
      <header className="container mx-auto px-4 pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
            Consistency on Autopilot
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The all-in-one platform that helps digital creators maintain consistent content publishing across all platforms while saving time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/auth')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Stay On
            </button>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border border-indigo-600 hover:bg-indigo-50 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to stay consistent</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Share2}
            title="Cross-Platform Publishing"
            description="Publish seamlessly across LinkedIn, X, Facebook, Instagram, and YouTube from a single dashboard."
          />
          <FeatureCard
            icon={Calendar}
            title="Smart Scheduling"
            description="Plan and schedule your content with our intuitive calendar interface and automated publishing."
          />
          <FeatureCard
            icon={BarChart3}
            title="Analytics Dashboard"
            description="Track your consistency metrics and content performance with detailed analytics."
          />
          <FeatureCard
            icon={Zap}
            title="AI-Powered Tools"
            description="Leverage AI to maintain content quality and optimize posting schedules."
          />
          <FeatureCard
            icon={Users}
            title="Team Collaboration"
            description="Work seamlessly with your team members with built-in collaboration tools."
          />
          <FeatureCard
            icon={Cloud}
            title="Media Management"
            description="Store and organize your media assets in our cloud-based library."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-5">Simple, transparent pricing</h2>
          <p className="text-gray-600 mb-20 text-center">No hidden fees, no surprises. Choose the plan that's right for you.</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              tier="Starter"
              price="$9/month"
              yearlyPrice="$90/year"
              features={[
                "2 social accounts",
                "30 posts/month",
                "Basic analytics (14-day history)",
                "Essential AI features",
                "10 basic templates",
                "7-day content calendar",
                "Basic scheduling",
                "Email support"
              ]}
            />
            <PricingCard
              tier="Pro"
              price="$19/month"
              yearlyPrice="$190/year"
              isPopular={true}
              features={[
                "5 social accounts",
                "200 posts/month",
                "Advanced analytics (30-day history)",
                "All AI features",
                "30+ premium templates",
                "30-day content calendar",
                "Smart scheduling",
                "Priority support",
                "Bulk scheduling",
                "Content recycling",
                "5GB media storage"
              ]}
            />
            <PricingCard
              tier="Creator"
              price="$30/month"
              yearlyPrice="$300/year"
              features={[
                "10 social accounts",
                "Unlimited posts",
                "Full analytics suite (90-day history)",
                "Advanced AI capabilities",
                "50+ premium templates",
                "90-day content calendar",
                "API access",
                "Premium support",
                "10GB media storage",
                "Custom tracking pixels",
                "White-label reports",
                "Advanced automation"
              ]}
            />
          </div>
        </div>
      </section>      

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter for the latest social media strategies, tips, and insights.
          </p>
          <NewsletterForm source="homepage" className="max-w-md mx-auto" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to level up your content game?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creators who've transformed their content workflow with Stayon.one
          </p>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-white mb-4">Stayon.one</h3>
              <p className="text-sm">Empowering creators with consistency and automation.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white cursor-pointer">Features</li>
                <li className="hover:text-white cursor-pointer">Pricing</li>
                <li className="hover:text-white cursor-pointer">Integrations</li>
                <li className="hover:text-white cursor-pointer">API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:support@stayon.one"
                    className="hover:text-white transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <div>© 2024 Stayon.one. All rights reserved.</div>
            <div className="mt-2">
              Made with <span className="text-purple-500">💜</span> by{' '}
              <a
                href="https://x.com/yasiten"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Yas Merak
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;