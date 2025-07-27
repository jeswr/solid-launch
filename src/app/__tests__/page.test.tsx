import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '../page';
import { ThemeProvider } from '@/lib/themeContext';

// Mock the RDF utilities
jest.mock('@/lib/rdfUtils', () => ({
  loadAllApps: jest.fn().mockResolvedValue([
    {
      id: 'app1',
      name: 'Test App 1',
      description: 'Description 1',
      homepage: 'https://app1.com',
      category: 'Productivity',
      image: 'https://app1.com/icon.png',
    },
    {
      id: 'app2',
      name: 'Test App 2',
      description: 'Description 2',
      homepage: 'https://app2.com',
      category: 'Games',
      image: 'https://app2.com/icon.png',
    },
  ]),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock the AppCard component to avoid nested component issues
jest.mock('@/components/AppCard', () => {
  return function MockAppCard({ app }: { app: { name: string; description: string; category: string } }) {
    return (
      <div>
        <h3>{app.name}</h3>
        <p>{app.description}</p>
        <span>{app.category}</span>
      </div>
    );
  };
});

describe('Page - Search Functionality', () => {
  const renderPage = () => {
    render(
      <ThemeProvider>
        <Page />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input correctly', async () => {
    renderPage();

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search apps...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('search input has correct attributes for Safari compatibility', async () => {
    renderPage();

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search apps...');
      
      // Should use type="text" instead of type="search" for better Safari compatibility
      expect(searchInput).toHaveAttribute('type', 'text');
      
      // Should have proper styling classes
      expect(searchInput).toHaveClass('w-full', 'pl-10', 'pr-4', 'py-2');
    });
  });

  it('filters apps based on search term', async () => {
    const user = userEvent.setup();
    renderPage();

    // Wait for apps to load
    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
      expect(screen.getByText('Test App 2')).toBeInTheDocument();
    });

    // Type in search
    const searchInput = screen.getByPlaceholderText('Search apps...');
    await user.type(searchInput, 'App 1');

    // Should only show matching app
    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
      expect(screen.queryByText('Test App 2')).not.toBeInTheDocument();
    });
  });

  it('search is case-insensitive', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search apps...');
    await user.type(searchInput, 'test app');

    // Should show both apps
    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
      expect(screen.getByText('Test App 2')).toBeInTheDocument();
    });
  });

  it('searches in app descriptions', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search apps...');
    await user.type(searchInput, 'Description 1');

    // Should show only the app with matching description
    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
      expect(screen.queryByText('Test App 2')).not.toBeInTheDocument();
    });
  });

  it('searches in app categories', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search apps...');
    await user.type(searchInput, 'Productivity');

    // Should show only the app with matching category
    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
      expect(screen.queryByText('Test App 2')).not.toBeInTheDocument();
    });
  });

  it('shows no results message when search has no matches', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search apps...');
    await user.type(searchInput, 'nonexistent');

    // Should show no results message
    await waitFor(() => {
      expect(screen.getByText('No applications found matching your criteria.')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
    });
  });

  it('clears search results when input is cleared', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search apps...');
    
    // Type and then clear
    await user.type(searchInput, 'App 1');
    
    await waitFor(() => {
      expect(screen.queryByText('Test App 2')).not.toBeInTheDocument();
    });
    
    await user.clear(searchInput);
    
    // Should show all apps again
    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
      expect(screen.getByText('Test App 2')).toBeInTheDocument();
    });
  });

  it('search input is accessible', async () => {
    renderPage();

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search apps...');
      
      // Should be focusable
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);
    });
  });

  it('search icon is visible', async () => {
    renderPage();

    await waitFor(() => {
      // Look for the Search icon by its container
      const searchContainer = screen.getByPlaceholderText('Search apps...').parentElement;
      expect(searchContainer).toHaveClass('relative');
      
      // The Search icon should be positioned absolutely
      const searchIcon = searchContainer?.querySelector('.absolute.left-3');
      expect(searchIcon).toBeInTheDocument();
    });
  });
});