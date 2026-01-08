# Responsive Design Documentation

This application is fully responsive and optimized for mobile, tablet, and desktop viewports.

## Viewport Support

### Mobile (320px+)
- Minimum supported width: 320px
- Single column layout
- Full-width form inputs
- Stacked buttons
- Touch-friendly tap targets (44px minimum)

### Tablet (640px - 1024px)
- Responsive padding adjustments (sm: breakpoint)
- Adaptive button sizing
- Optimized spacing

### Desktop (1024px+)
- Maximum content width: 7xl (1280px)
- Centered layout with side margins
- Hover states enabled
- Multi-column feature grid

## Responsive Features by Component

### Authentication Pages (signin/signup)
- **Mobile**: Full-width form with px-4 padding
- **Tablet**: Increased horizontal padding (sm:px-6)
- **Desktop**: Maximum padding (lg:px-8)
- Font size adapts: base on mobile, sm:text-sm on larger screens

### Dashboard
- **Header**: Flex layout with space-between, maintains logo and logout button visibility
- **Task Form**: Button switches from full-width to auto-width at sm breakpoint
- **Task List**: Cards stack vertically on all screen sizes for optimal readability

### Task Components
- **Task Cards**: Fixed padding with flexible content area
- **Buttons**: Consistent 44px+ tap target size for mobile accessibility
- **Text**: Line clamping and ellipsis for long titles/descriptions

### Landing Page
- **Hero Section**: Centered on mobile, full-width responsive
- **Feature Grid**:
  - Mobile: Single column (grid-cols-1)
  - Tablet+: Three columns (md:grid-cols-3)

## Tailwind Breakpoints Used

```
sm: 640px   - Small tablets
md: 768px   - Tablets
lg: 1024px  - Desktops
xl: 1280px  - Large desktops
```

## Testing Checklist

- [x] 320px viewport (iPhone SE)
- [x] 375px viewport (iPhone 12/13)
- [x] 768px viewport (iPad)
- [x] 1024px viewport (iPad Pro)
- [x] 1440px+ viewport (Desktop)

## Mobile-First Approach

All styles are written mobile-first, with progressive enhancement for larger screens:
1. Base styles target mobile (320px+)
2. sm: prefixes enhance for 640px+
3. md: prefixes enhance for 768px+
4. lg: prefixes enhance for 1024px+

## Touch Interactions

- All interactive elements meet WCAG 2.1 minimum size (44x44px)
- Hover states gracefully degrade to active states on touch devices
- Form inputs have adequate padding for easy interaction
- Buttons provide visual feedback on press
