import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { NewsletterForm } from '../components/NewsletterForm';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Mastering Social Media Consistency: A Complete Guide',
    excerpt: 'Learn how to maintain a consistent social media presence across multiple platforms without burning out.',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
    category: 'Strategy',
    slug: 'mastering-social-media-consistency'
  },
  {
    id: '2',
    title: 'AI in Content Creation: Balancing Automation and Authenticity',
    excerpt: 'Discover how to leverage AI tools while maintaining your unique brand voice and authenticity.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    category: 'Technology',
    slug: 'ai-in-content-creation'
  },
  {
    id: '3',
    title: '10 Time-Saving Social Media Management Tips',
    excerpt: 'Expert tips to streamline your social media workflow and maximize productivity.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    category: 'Productivity',
    slug: 'time-saving-social-media-tips'
  }
];

export function Blog() {
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

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Blog</h1>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Tips, strategies, and insights to help you maintain consistency across your social media presence.
          </p>

          <div className="space-y-6 sm:space-y-8">
            {blogPosts.map((post) => (
              <article 
                key={post.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link to={`/blog/${post.slug}`} className="block sm:flex">
                  <div className="sm:w-1/3">
                    <div className="aspect-video sm:aspect-auto sm:h-full">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 sm:w-2/3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 mb-2">
                      <span className="px-2 py-1 bg-indigo-50 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Want to stay updated? Join our newsletter for weekly tips and insights.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterForm source="blog" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}