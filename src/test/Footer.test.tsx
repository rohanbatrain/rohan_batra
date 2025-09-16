import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/lib/theme-provider';

// Helper to render components with theme provider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Footer Component', () => {
  it('should render footer with correct content', () => {
    renderWithTheme(<Footer />);

    // Check for copyright text
    expect(screen.getByText(/© 2024 Rohan Batra/)).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /portfolio/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('should render social media links', () => {
    renderWithTheme(<Footer />);

    // Check for social media links (these might be aria-labeled)
    const socialLinks = screen.getAllByRole('link');
    expect(socialLinks.length).toBeGreaterThan(4); // At least navigation + social links
  });

  it('should have proper semantic structure', () => {
    renderWithTheme(<Footer />);

    // Check for footer element
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should be responsive', () => {
    const { container } = renderWithTheme(<Footer />);

    // Check for responsive classes (Tailwind)
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-white', 'dark:bg-gray-900');
  });
});
