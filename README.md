# 🍺 Bierephilo

A modern, mobile-first static website built with HTML, CSS, and JavaScript. Optimized for touch interactions and progressive web app capabilities.

## Features

- **Mobile-First Design**: Responsive layout that works perfectly on all screen sizes
- **Touch-Optimized**: Designed for touch interactions with gesture support
- **Progressive Web App**: Can be installed on mobile devices and works offline
- **Modern UI**: Clean, beautiful design with smooth animations
- **Performance**: Fast loading and optimized for mobile networks
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Dark Mode**: Automatic dark mode support based on system preferences

## Technologies Used

- **HTML5**: Semantic markup with mobile viewport optimization
- **CSS3**: Modern CSS with custom properties, flexbox, grid, and animations
- **JavaScript**: ES6+ features with touch events and Intersection Observer
- **Service Worker**: Offline support and caching
- **Web Manifest**: PWA installation support

## Project Structure

```
bierephilo/
├── index.html          # Main HTML file
├── styles.css          # Mobile-first CSS styles
├── script.js           # JavaScript functionality
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline support
└── README.md          # This file
```

## Key Features

### Mobile Navigation
- Hamburger menu for mobile devices
- Smooth scrolling to sections
- Active link highlighting
- Auto-close on selection

### Touch Interactions
- Swipe gestures on cards
- Touch-optimized button sizes (min 44x44px)
- Prevent double-tap zoom
- Smooth animations

### Form Handling
- Client-side validation with visual feedback
- Toast notifications
- Success messages
- Accessible form controls

### PWA Capabilities
- Install prompt
- Offline support via service worker
- App manifest for home screen installation
- Background sync support
- Push notification ready

### Animations
- Fade-in effects on scroll
- Smooth transitions
- Intersection Observer for performance
- Reduced motion support for accessibility

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 5+)

## Setup & Usage

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bierephilo
   ```

2. **Serve the files**

   Option A - Python:
   ```bash
   python -m http.server 8000
   ```

   Option B - Node.js:
   ```bash
   npx serve
   ```

   Option C - PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

4. **For PWA testing**, use HTTPS or localhost

## Customization

### Colors
Edit CSS custom properties in `styles.css`:
```css
:root {
    --primary-color: #2196F3;
    --secondary-color: #FF9800;
    /* ... more variables */
}
```

### Content
Modify sections in `index.html`:
- Hero section
- About section
- Features section
- Contact form

### Functionality
Extend JavaScript in `script.js`:
- Add new event listeners
- Implement custom interactions
- Integrate with APIs

## Performance Optimizations

- Debounced scroll events
- Passive event listeners
- Intersection Observer for lazy animations
- Service worker caching
- CSS containment
- Minimal dependencies (no frameworks!)

## Accessibility Features

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader friendly
- Color contrast compliance
- Reduced motion support

## Future Enhancements

- Add custom icons (192x192 and 512x512 PNG)
- Implement actual form submission backend
- Add more interactive features
- Multi-language support
- Analytics integration
- More sections and pages

## Notes

- Icons (`icon-192.png` and `icon-512.png`) need to be added for full PWA support
- The contact form currently logs to console - integrate with a backend for real submissions
- Service worker requires HTTPS in production (works on localhost for testing)

## License

MIT

## Author

Created with Claude Code