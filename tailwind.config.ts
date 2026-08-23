import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f2540',
        gold: '#c9962c',
      },
    },
  },
  plugins: [],
};

export default config;
