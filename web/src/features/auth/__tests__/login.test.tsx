import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthPage from '../AuthPage';

// Mock Clerk's SignIn widget so the test doesn't need a Clerk environment.
vi.mock('@clerk/clerk-react', () => ({
  SignIn: () => <div data-testid="sign-in-component">Mocked SignIn</div>,
}));

describe('AuthPage', () => {
  it('renders the sign-in screen when signed out', () => {
    render(<AuthPage />);
    expect(screen.getByText('Sign in to Glance')).toBeDefined();
    expect(screen.getByTestId('sign-in-component')).toBeDefined();
  });
});
