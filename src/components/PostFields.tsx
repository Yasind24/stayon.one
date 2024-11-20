import React from 'react';
import { POST_TYPES } from '../lib/platforms/postTypes';
import { MediaUpload } from './MediaUpload';
import { Link } from 'lucide-react';

interface PostFieldsProps {
  postType: string;
  content: string;
  setContent: (content: string) => void;
  mediaUrl: string;
  setMediaUrl: (url: string) => void;
  link: string;
  setLink: (link: string) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  thumbnail: string;
  setThumbnail: (url: string) => void;
}

export function PostFields({
  postType,
  content,
  setContent,
  mediaUrl,
  setMediaUrl,
  link,
  setLink,
  title,
  setTitle,
  description,
  setDescription,
  thumbnail,
  setThumbnail
}: PostFieldsProps) {
  const type = POST_TYPES.find(t => t.id === postType);
  if (!type) return null;

  return (
    <div className="space-y-6">
      {type.fields.title && (
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter title"
          />
        </div>
      )}

      {type.fields.content && (
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Write your content here..."
          />
        </div>
      )}

      {type.fields.description && (
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Enter description"
          />
        </div>
      )}

      {type.fields.media && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media
          </label>
          <MediaUpload
            onUpload={setMediaUrl}
            onRemove={() => setMediaUrl('')}
            mediaUrl={mediaUrl}
          />
        </div>
      )}

      {type.fields.thumbnail && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail
          </label>
          <MediaUpload
            onUpload={setThumbnail}
            onRemove={() => setThumbnail('')}
            mediaUrl={thumbnail}
          />
          <p className="mt-1 text-sm text-gray-500">
            Custom thumbnail for your video
          </p>
        </div>
      )}

      {type.fields.link && (
        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
            Link (optional)
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
            <div className="px-3 py-2 border-r border-gray-300">
              <Link className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-1 px-3 py-2 border-none focus:ring-0"
              placeholder="https://example.com"
            />
          </div>
        </div>
      )}
    </div>
  );
}