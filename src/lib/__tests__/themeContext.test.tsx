import React from 'react';
import { render, screen, act, renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../themeContext';

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage and reset document classes before each test
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    
    // Reset localStorage mock
    jest.clearAllMocks();
  });

  it('provides default light theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('light');
  });

  it('reads theme from localStorage on mount', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(localStorage.getItem).toHaveBeenCalledWith('theme');
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('uses system preference when no saved theme', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    (window.matchMedia as jest.Mock).mockReturnValue({
      matches: true, // dark mode preference
      media: '(prefers-color-scheme: dark)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles from light to dark mode', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles from dark to light mode', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('properly removes dark class when switching to light mode', () => {
    // Start with dark mode
    document.documentElement.classList.add('dark');
    (localStorage.getItem as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    // Toggle to light mode
    act(() => {
      result.current.toggleTheme();
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('handles multiple toggles correctly', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    // Toggle to dark
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle back to light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Toggle to dark again
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('throws error when useTheme is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleError.mockRestore();
  });

  it('prevents hydration mismatch by returning default values before mount', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      const [isMounted, setIsMounted] = React.useState(false);
      
      React.useEffect(() => {
        setIsMounted(true);
      }, []);
      
      // During SSR/initial render, we should get a consistent theme
      return <div>{isMounted ? `mounted-${theme}` : `initial-${theme}`}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially should show the initial theme
    expect(screen.getByText('initial-light')).toBeInTheDocument();
    
    // After mount, should show the mounted theme
    act(() => {
      // Force a re-render to simulate the effect running
    });
    
    expect(screen.getByText('mounted-light')).toBeInTheDocument();
  });
});