import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthPage from '../AuthPage.js';
import React from 'react';

// Mock Clerk components
vi.mock('@clerk/clerk-react', () => ({
  SignIn: () => <div data-testid="sign-in-component">Mocked SignIn</div>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-in">{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div data-testid="signed-out">{children}</div>,
}));

describe('AuthPage', () => {
  it('renders the sign in component when signed out', () => {
    // Note: Since we are mocking SignedIn/SignedOut to both render children for testing structure,
    // we just verify elements are present.
    render(<AuthPage />);
    expect(screen.getByText('Sign in to Glance')).toBeDefined();
    expect(screen.getByTestId('sign-in-component')).toBeDefined();
  });

  it('renders the welcome message when signed in', () => {
    render(<AuthPage />);
    expect(screen.getByText('Welcome to Glance!')).toBeDefined();
    expect(screen.getByText('You are now signed in.')).toBeDefined();
  });
});
