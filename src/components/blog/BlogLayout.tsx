import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';
import { NewsletterForm } from '../NewsletterForm';

interface BlogLayoutProps {
  children: React.ReactNode;
  title: string;
  category: string;
  imageUrl: string;
}

export function BlogLayout({ children, title, category, imageUrl }: BlogLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Back to Blog</span>
          </button>
          <Logo />
        </div>

        <article className="max-w-3xl mx-auto">
          <header className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-sm text-indigo-600 mb-3 sm:mb-4">
              <span className="px-2 py-1 bg-indigo-50 rounded-full">
                {category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{title}</h1>
            <div className="aspect-video rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </header>

          <div className="prose prose-sm sm:prose-lg max-w-none">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8">
              {children}
            </div>
          </div>

          <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Subscribe to our newsletter for more insights on social media management and content creation.
            </p>
            <NewsletterForm source="blog-post" />
          </div>
        </article>
      </div>
    </div>
  );
}