/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},

    // Best practice: adds vendor prefixes for browser compatibility
    autoprefixer: {},
  },
};

export default config;