import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        ink: '#0f2540',
        gold: '#c9962c',
        // Validated two-series categorical pair (dataviz skill) - used for
        // chart series (income/expenses), never for chrome or brand.
        chart: {
          blue: '#2a78d6',
          orange: '#eb6834',
        },
        // Fixed status palette - reserved for state (profit/loss, over/under
        // budget, active/inactive), never reused as a plain accent color.
        success: {
          DEFAULT: '#0ca30c',
          text: '#006300',
          bg: '#eafbea',
        },
        danger: {
          DEFAULT: '#d03b3b',
          text: '#a02323',
          bg: '#fdeeee',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 37, 64, 0.04), 0 1px 3px 0 rgba(15, 37, 64, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(15, 37, 64, 0.10), 0 2px 4px -2px rgba(15, 37, 64, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
