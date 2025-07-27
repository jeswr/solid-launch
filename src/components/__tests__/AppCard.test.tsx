import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import AppCard from '../AppCard';
import { SolidApp } from '@/lib/rdfUtils';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('AppCard', () => {
  const mockApp: SolidApp = {
    id: 'test-app',
    name: 'Test Application',
    description: 'A test application for unit testing',
    homepage: 'https://example.com',
    category: 'Productivity',
    image: 'https://example.com/icon.png',
    source: 'test-source',
  };

  it('renders app information correctly', () => {
    render(<AppCard app={mockApp} index={0} />);
    
    expect(screen.getByText('Test Application')).toBeInTheDocument();
    expect(screen.getByText('A test application for unit testing')).toBeInTheDocument();
    expect(screen.getByText('Productivity')).toBeInTheDocument();
  });

  it('displays image when valid URL is provided', () => {
    render(<AppCard app={mockApp} index={0} />);
    
    const image = screen.getByAltText('Test Application');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/icon.png');
  });

  it('displays initials when image URL is invalid', () => {
    const appWithoutImage = { ...mockApp, image: undefined };
    render(<AppCard app={appWithoutImage} index={0} />);
    
    // Should display "TA" for "Test Application"
    expect(screen.getByText('TA')).toBeInTheDocument();
  });

  it('displays initials when image fails to load', async () => {
    render(<AppCard app={mockApp} index={0} />);
    
    const image = screen.getByAltText('Test Application');
    
    // Simulate image load error wrapped in act
    await act(async () => {
      const errorEvent = new Event('error', { bubbles: true });
      image.dispatchEvent(errorEvent);
    });
    
    await waitFor(() => {
      expect(screen.getByText('TA')).toBeInTheDocument();
    });
  });

  it('shows loading state with initials while image loads', () => {
    render(<AppCard app={mockApp} index={0} />);
    
    // Initially should show initials as placeholder
    expect(screen.getByText('TA')).toBeInTheDocument();
  });

  it('handles single-word app names correctly', () => {
    const singleWordApp = { ...mockApp, name: 'Solid', image: undefined };
    render(<AppCard app={singleWordApp} index={0} />);
    
    // Should display "SO" for "Solid"
    expect(screen.getByText('SO')).toBeInTheDocument();
  });

  it('handles empty app names gracefully', () => {
    const emptyNameApp = { ...mockApp, name: '', image: undefined };
    render(<AppCard app={emptyNameApp} index={0} />);
    
    // Should display "?" for empty names
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('includes crossOrigin attribute for external images', () => {
    render(<AppCard app={mockApp} index={0} />);
    
    const image = screen.getByAltText('Test Application');
    expect(image).toHaveAttribute('crossorigin', 'anonymous');
  });
});