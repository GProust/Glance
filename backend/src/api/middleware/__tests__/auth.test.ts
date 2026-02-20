import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClerkClient } from '@clerk/backend';
import { UnauthorizedError } from '../../../core/config/error-handling.js';

const { mockClerkClientInstance } = vi.hoisted(() => ({
  mockClerkClientInstance: {
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

// Import middleware AFTER mocks
import { clerkAuthMiddleware } from '../auth.js';

describe('clerkAuthMiddleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = vi.fn();
  });

  it('should throw UnauthorizedError if no session token is provided', async () => {
    await clerkAuthMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(mockNext.mock.calls[0][0].message).toBe('No session token provided');
  });

  it('should throw UnauthorizedError if unauthenticated', async () => {
    mockReq.headers.authorization = 'Bearer invalid_token';
    mockClerkClientInstance.authenticateRequest.mockResolvedValue({
      isSignedIn: false,
      status: 'unauthenticated',
    });

    await clerkAuthMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(mockNext.mock.calls[0][0].message).toBe('Invalid session token');
  });

  it('should call next() if authenticated', async () => {
    mockReq.headers.authorization = 'Bearer valid_token';
    const mockAuth = { userId: 'user_123' };
    mockClerkClientInstance.authenticateRequest.mockResolvedValue({
      isSignedIn: true,
      status: 'signed-in',
      toAuth: () => mockAuth,
    });

    await clerkAuthMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq.auth).toEqual(mockAuth);
    expect(mockNext).toHaveBeenCalledWith();
  });
});
