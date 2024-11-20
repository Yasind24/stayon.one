export interface PostType {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  fields: {
    content: boolean;
    media: boolean;
    link: boolean;
    title?: boolean;
    description?: boolean;
    thumbnail?: boolean;
  };
}

export const POST_TYPES: PostType[] = [
  {
    id: 'text',
    name: 'Text Post',
    description: 'A simple text-based post',
    platforms: ['x', 'linkedin', 'facebook', 'threads'],
    fields: {
      content: true,
      media: false,
      link: true
    }
  },
  {
    id: 'media',
    name: 'Media Post',
    description: 'Share images or videos',
    platforms: ['x', 'linkedin', 'facebook', 'instagram', 'threads'],
    fields: {
      content: true,
      media: true,
      link: true
    }
  },
  {
    id: 'article',
    name: 'Article',
    description: 'Share a detailed article with formatting',
    platforms: ['linkedin'],
    fields: {
      content: true,
      media: true,
      link: true,
      title: true,
      description: true
    }
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Upload and share a video',
    platforms: ['youtube'],
    fields: {
      content: true,
      media: true,
      title: true,
      description: true,
      thumbnail: true
    }
  }
];