# Browser Compatibility Testing Guide

This document outlines manual testing procedures for browser-specific issues that are difficult to test automatically.

## Safari-Specific Tests

### 1. Search Bar Visibility
**Issue**: Search bar may not appear in Safari due to CSS compatibility issues.

**Test Steps**:
1. Open the application in Safari (both macOS and iOS)
2. Navigate to the main page
3. Verify the search bar is visible and properly styled
4. Verify the search icon is visible within the search bar
5. Test that the search bar is focusable and accepts input
6. Verify no zoom occurs on iOS Safari when focusing the input

**Expected Result**: 
- Search bar should be visible with proper styling
- No webkit-specific appearance issues
- Font size should be 16px to prevent zoom on iOS

### 2. Form Element Styling
**Test Steps**:
1. Check all form inputs and select elements in Safari
2. Verify they don't have native Safari styling
3. Verify custom styling is applied correctly

**Expected Result**:
- All form elements should have `-webkit-appearance: none`
- Custom styling should be consistent across browsers

## Cross-Browser Image Loading Tests

### 1. External Image CORS
**Issue**: App icons from external sources may fail to load due to CORS policies.

**Test Steps**:
1. Load the application in different browsers (Chrome, Firefox, Safari, Edge)
2. Check that app icons load correctly
3. Open browser console and check for CORS errors
4. Test with both HTTP and HTTPS image sources

**Expected Result**:
- Images should load with `crossOrigin="anonymous"` attribute
- Fallback initials should display if image fails to load
- Loading state should show initials while image loads

### 2. Image Error Handling
**Test Steps**:
1. Temporarily block image domains in browser
2. Verify fallback initials display correctly
3. Check that app cards remain functional without images

**Expected Result**:
- Graceful fallback to generated initials
- No broken image icons
- Consistent color generation for initials background

## Theme Toggle Tests

### 1. Light/Dark Mode Toggle
**Issue**: Theme toggle may not properly switch between light and dark modes.

**Test Steps**:
1. Load the application
2. Click the theme toggle button (moon/sun icon)
3. Verify dark mode is applied (dark backgrounds, light text)
4. Click the toggle again
5. Verify light mode is properly restored
6. Refresh the page and verify theme persistence

**Expected Result**:
- Smooth transition between themes
- Proper addition/removal of 'dark' class on document element
- Theme preference saved in localStorage
- No flickering on page load

### 2. System Preference Detection
**Test Steps**:
1. Clear localStorage
2. Set system to dark mode preference
3. Load the application
4. Verify it respects system preference

**Expected Result**:
- Application should detect and use system color scheme preference
- User can still override with manual toggle

## Automated Test Coverage

The following issues are covered by automated tests:

1. **AppCard Component** (`src/components/__tests__/AppCard.test.tsx`)
   - Icon display logic
   - Image error handling
   - Fallback initials generation
   - CORS attribute presence

2. **Theme Context** (`src/lib/__tests__/themeContext.test.tsx`)
   - Theme toggle functionality
   - LocalStorage persistence
   - Dark class management
   - System preference detection

3. **Search Functionality** (`src/app/__tests__/page.test.tsx`)
   - Search input rendering
   - Safari-compatible attributes
   - Search filtering logic
   - Accessibility features

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Browser Testing Tools

For comprehensive browser testing, consider using:
- BrowserStack for cross-browser testing
- Safari Technology Preview for latest Safari features
- iOS Simulator for mobile Safari testing
- Chrome DevTools device emulation