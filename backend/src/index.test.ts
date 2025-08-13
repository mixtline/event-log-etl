// Establish mocks BEFORE loading the app (and its transitive imports)
jest.mock('node:fs');
jest.mock('node:readline');
jest.mock('fs/promises', () => {
  const access = jest.fn();
  return {
    __esModule: true,
    default: { access },
  };
});

import request from 'supertest';
import { ApiResponse } from './types/ApiResponse.type';
import { Readable } from 'node:stream';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import fsPromises from 'fs/promises';

// Import app after mocks are set up
const app = require('./app').default;

// Typed mocked functions
const mockCreateReadStream = createReadStream as jest.MockedFunction<typeof createReadStream>;
const mockCreateInterface = createInterface as jest.MockedFunction<typeof createInterface>;
const mockAccess = (fsPromises as unknown as { access: jest.Mock }).access;

// Helper to create a minimal async-iterable readline interface
function createMockReadlineInterface(lines: string[]) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const line of lines) {
        yield line;
      }
    },
  };
}

describe('GET /events/log', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return parsed log entries', async () => {
    // Pretend the file exists
    mockAccess.mockResolvedValue(undefined);

    // Mock log data
    const mockLogLines = [
      '2024-01-01T10:00:00 - User 123 Event: login',
      '2024-01-01T10:05:00 - User 456 Event: logout',
      '2024-01-01T10:10:00 - User 123 Event: click_button',
    ];

    // Mock stream and readline
    const mockStream = new Readable({ read() {} });
    mockCreateReadStream.mockReturnValue(mockStream as any);

    const mockReadlineInterface = createMockReadlineInterface(mockLogLines);
    mockCreateInterface.mockReturnValue(mockReadlineInterface as any);

    const response = await request(app).get('/events/log');
    const body = response.body as ApiResponse;

    expect(response.status).toBe(200);
    expect(body.isSuccess).toBe(true);
    expect(body.result).toHaveLength(3);
    expect(body.result[0]).toMatchObject({
      timestamp: '2024-01-01T10:00:00',
      userId: 123,
      eventType: 'login',
      originalLine: '2024-01-01T10:00:00 - User 123 Event: login',
    });

    expect(mockAccess).toHaveBeenCalled();
    expect(mockCreateReadStream).toHaveBeenCalled();
    expect(mockCreateInterface).toHaveBeenCalled();
  });

  test('should return empty result for no log entries', async () => {
    mockAccess.mockResolvedValue(undefined);

    const mockStream = new Readable();
    mockCreateReadStream.mockReturnValue(mockStream as any);

    const mockReadlineInterface = createMockReadlineInterface([]);
    mockCreateInterface.mockReturnValue(mockReadlineInterface as any);

    const response = await request(app).get('/events/log');
    const body = response.body as ApiResponse;

    expect(response.status).toBe(200);
    expect(body.isSuccess).toBe(true);
    expect(body.result).toHaveLength(0);
  });

  test('should return 404 when log file does not exist', async () => {
    // Mock file doesn't exist
    mockAccess.mockRejectedValue(new Error('ENOENT: no such file or directory'));

    const response = await request(app).get('/events/log');
    const body = response.body as ApiResponse;

    expect(response.status).toBe(404);
    expect(body.isSuccess).toBe(false);
    expect(body.message).toBe('Log file not found');
    expect(body.errorType).toBe('FileNotFound');
  });

  test('should handle invalid date filters gracefully', async () => {
    mockAccess.mockResolvedValue(undefined);

    const mockLogLines = [
      '2024-01-01T10:00:00 - User 123 Event: login',
      '2024-01-01T10:05:00 - User 456 Event: logout',
    ];

    const mockStream = new Readable({ read() {} });
    mockCreateReadStream.mockReturnValue(mockStream as any);

    const mockReadlineInterface = createMockReadlineInterface(mockLogLines);
    mockCreateInterface.mockReturnValue(mockReadlineInterface as any);

    const response = await request(app)
      .get('/events/log')
      .query({ fromDate: 'invalid-date', toDate: '2024-01-01T10:10:00' });

    const body = response.body as ApiResponse;

    expect(response.status).toBe(200);
    expect(body.isSuccess).toBe(true);
    expect(body.result).toHaveLength(2); // Both entries should be returned
  });

  test('should filter by userId', async () => {
    mockAccess.mockResolvedValue(undefined);

    const mockLogLines = [
      '2024-01-01T10:00:00 - User 123 Event: login',
      '2024-01-01T10:05:00 - User 456 Event: logout',
    ];

    const mockStream = new Readable({ read() {} });
    mockCreateReadStream.mockReturnValue(mockStream as any);

    const mockReadlineInterface = createMockReadlineInterface(mockLogLines);
    mockCreateInterface.mockReturnValue(mockReadlineInterface as any);

    const response = await request(app)
      .get('/events/log')
      .query({ userId: '123' });

    const body = response.body as ApiResponse;

    expect(response.status).toBe(200);
    expect(body.isSuccess).toBe(true);
    expect(body.result).toHaveLength(1);
    expect(body.result[0].userId).toBe(123);
  });

  test('should filter by eventType', async () => {
    mockAccess.mockResolvedValue(undefined);

    const mockLogLines = [
      '2024-01-01T10:00:00 - User 123 Event: login',
      '2024-01-01T10:05:00 - User 456 Event: logout',
    ];

    const mockStream = new Readable({ read() {} });
    mockCreateReadStream.mockReturnValue(mockStream as any);

    const mockReadlineInterface = createMockReadlineInterface(mockLogLines);
    mockCreateInterface.mockReturnValue(mockReadlineInterface as any);

    const response = await request(app)
      .get('/events/log')
      .query({ eventType: 'logout' });

    const body = response.body as ApiResponse;

    expect(response.status).toBe(200);
    expect(body.isSuccess).toBe(true);
    expect(body.result).toHaveLength(1);
    expect(body.result[0].eventType).toBe('logout');
  });

  test('should handle multiple filters', async () => {
    mockAccess.mockResolvedValue(undefined);

    const mockLogLines = [
      '2024-01-01T10:00:00 - User 123 Event: login',
      '2024-01-01T10:05:00 - User 456 Event: logout',
      '2024-01-01T10:10:00 - User 123 Event: click_button',
    ];

    const mockStream = new Readable({ read() {} });
    mockCreateReadStream.mockReturnValue(mockStream as any);

    const mockReadlineInterface = createMockReadlineInterface(mockLogLines);
    mockCreateInterface.mockReturnValue(mockReadlineInterface as any);

    const response = await request(app)
      .get('/events/log')
      .query({ userId: '123', eventType: 'login' });

    const body = response.body as ApiResponse;

    expect(response.status).toBe(200);
    expect(body.isSuccess).toBe(true);
    expect(body.result).toHaveLength(1);
    expect(body.result[0].userId).toBe(123);
    expect(body.result[0].eventType).toBe('login');
  });

  test('should handle empty query parameters', async () => {
    mockAccess.mockResolvedValue(undefined);

    const mockLogLines = [
      '2024-01-01T10:00:00 - User 123 Event: login',
      '2024-01-01T10:05:00 - User 456 Event: logout',
    ];

    const mockStream = new Readable({ read() {} });
    mockCreateReadStream.mockReturnValue(mockStream as any);

    const mockReadlineInterface = createMockReadlineInterface(mockLogLines);
    mockCreateInterface.mockReturnValue(mockReadlineInterface as any);

    const response = await request(app).get('/events/log').query({});

    const body = response.body as ApiResponse;

    expect(response.status).toBe(200);
    expect(body.isSuccess).toBe(true);
    expect(body.result).toHaveLength(2); // Both entries should be returned
  });

  test('should handle malformed log entries gracefully', async () => {
    mockAccess.mockResolvedValue(undefined);

    const mockLogLines = [
      '2024-01-01T10:00:00 - User 123 Event: login',
      'This is a malformed log entry',
      '2024-01-01T10:05:00 - User 456 Event: logout',
    ];

    const mockStream = new Readable({ read() {} });
    mockCreateReadStream.mockReturnValue(mockStream as any);

    const mockReadlineInterface = createMockReadlineInterface(mockLogLines);
    mockCreateInterface.mockReturnValue(mockReadlineInterface as any);

    const response = await request(app).get('/events/log');
    const body = response.body as ApiResponse;

    expect(response.status).toBe(200);
    expect(body.isSuccess).toBe(true);
    expect(body.result).toHaveLength(2); // Only valid entries should be returned
  });
});
