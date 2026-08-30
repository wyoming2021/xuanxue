// Tailwind CSS configuration for the Xuan Yu project
// This config defines the files Tailwind should scan for class names.
// It avoids malformed glob patterns that cause Turbopack build errors.
module.exports = {
  content: [
    // Scan all component and page files for Tailwind class usage.
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    // If you have additional directories (e.g., "src"), add them here.
    // "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
