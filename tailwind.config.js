/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'h2': {
              marginTop: '2rem',
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: '600',
              lineHeight: '2rem',
              color: '#111827',
            },
            'p': {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
              lineHeight: '1.75',
              color: '#374151',
            },
            'p.lead': {
              fontSize: '1.125rem',
              fontWeight: '500',
              color: '#4B5563',
            },
            'ul': {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
              paddingLeft: '1.25rem',
              listStyleType: 'disc',
            },
            'li': {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              paddingLeft: '0.5rem',
              color: '#374151',
            },
            'a': {
              color: '#4F46E5',
              textDecoration: 'none',
              '&:hover': {
                color: '#4338CA',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};