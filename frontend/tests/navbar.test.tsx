import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../src/components/Navbar';
import { AuthProvider } from '../src/context/AuthContext';

// Mock AuthContext
vi.mock('../src/context/AuthContext', async () => {
  const actual = await vi.importActual('../src/context/AuthContext') as any;
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      logout: vi.fn(),
      loading: false,
    }),
  };
});

describe('Navbar Component', () => {
  it('renders login and signup links when not authenticated', () => {
    render(<Navbar />);
    
    expect(screen.getByText(/Log in/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  it('renders brand name', () => {
    render(<Navbar />);
    expect(screen.getByText(/REMS/i)).toBeInTheDocument();
  });
});
