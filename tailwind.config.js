/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/templates/*.{hbs,html}",
    "./docs/**/*.{md,html}",
    "./dist/**/*.html",
    "./assets/**/*.html",
    "./src/**/*.js"
  ],
  safelist: [
    // Ensure dropdown classes are never purged
    'dropdown-open',
    'dropdown-content',
    'dropdown-end',
    'dropdown-top',
    'dropdown-bottom',
    'dropdown-left',
    'dropdown-right',
    'dropdown-hover',
    // Menu classes for search results
    'menu',
    'menu-lg',
    'menu-md',
    'menu-sm',
    // Essential base classes
    'bg-base-100',
    'bg-base-200',
    'bg-base-300',
    'rounded-box',
    'shadow',
    'hidden',
    'block',
    'p-2',
    'p-3',
    'p-4',
    'hover:bg-base-200',
    'hover:bg-base-100',
    'hover:bg-base-300',
    'truncate',
    'overflow-hidden',
    'text-base-content',
    'opacity-50',
    'opacity-70',
    'font-medium',
    'text-sm',
    'text-xs',
    'mt-1',
    'max-h-96',
    'overflow-y-auto',
    'overflow-x-hidden',
    'z-[1]',
    // Plain search result classes
    'cursor-pointer',
    'hover:bg-base-200',
    'bg-base-200',
    'border-base-300',
    'last:border-b-0',
    // Theme switcher classes
    'theme-toggle-btn',
    'theme-sun-icon',
    'theme-moon-icon',
    'text-base-content',
    'transition-opacity',
    'absolute',
    'opacity-0',
    'opacity-100'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
} 