import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClerkClient } from '@clerk/backend';

const { mockClerkClientInstance } = vi.hoisted(() => ({
  mockClerkClientInstance: {
    users: {
      getUser: vi.fn(),
    },
    authenticateRequest: vi.fn(),
  },
}));

vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(() => mockClerkClientInstance),
}));

vi.mock('../../../core/config/env.config.js', () => ({
  env: {
    CLERK_SECRET_KEY: 'test_secret',
  },
}));

// Import service AFTER mocks
import { ClerkAuthService } from '../clerk.service.js';

describe('ClerkAuthService', () => {
  let service: ClerkAuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ClerkAuthService();
  });

  it('should get a user by id', async () => {
    const mockUser = { id: 'user_123', emailAddresses: [{ emailAddress: 'test@example.com' }] };
    mockClerkClientInstance.users.getUser.mockResolvedValue(mockUser);

    const user = await service.getUser('user_123');

    expect(user).toEqual(mockUser);
    expect(mockClerkClientInstance.users.getUser).toHaveBeenCalledWith('user_123');
  });

  it('should verify a token', async () => {
    const mockRequestState = { status: 'signed-in', toAuth: () => ({ userId: 'user_123' }) };
    mockClerkClientInstance.authenticateRequest.mockResolvedValue(mockRequestState);

    const state = await service.verifyToken('valid_token');

    expect(state).toEqual(mockRequestState);
    expect(mockClerkClientInstance.authenticateRequest).toHaveBeenCalled();
  });
});
