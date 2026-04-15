import axios from 'axios';
import { fetchRoutes, sortRoutes, RouteEntry } from './fetch';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchRoutes', () => {
  const baseOptions = { baseUrl: 'http://localhost:3000' };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and normalizes routes from the default path', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        { method: 'get', path: '/users' },
        { method: 'POST', path: 'items', statusCode: 201, description: 'Create item' },
      ],
    } as any);

    const routes = await fetchRoutes(baseOptions);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3000/__routes',
      expect.objectContaining({ timeout: 5000 })
    );
    expect(routes).toEqual([
      { method: 'GET', path: '/users', statusCode: undefined, description: undefined },
      { method: 'POST', path: '/items', statusCode: 201, description: 'Create item' },
    ]);
  });

  it('uses a custom routesPath when provided', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] } as any);
    await fetchRoutes({ ...baseOptions, routesPath: '/api/routes' });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3000/api/routes',
      expect.any(Object)
    );
  });

  it('throws when the response is not an array', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { routes: [] } } as any);
    await expect(fetchRoutes(baseOptions)).rejects.toThrow('Expected an array of routes');
  });

  it('throws when a route entry is missing required fields', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ path: '/users' }] } as any);
    await expect(fetchRoutes(baseOptions)).rejects.toThrow('Invalid route entry');
  });

  it('throws a descriptive error when the request fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    await expect(fetchRoutes(baseOptions)).rejects.toThrow('Failed to fetch routes');
  });
});

describe('sortRoutes', () => {
  it('sorts routes by path then method', () => {
    const input: RouteEntry[] = [
      { method: 'POST', path: '/users' },
      { method: 'GET', path: '/items' },
      { method: 'GET', path: '/users' },
    ];
    const sorted = sortRoutes(input);
    expect(sorted.map(r => `${r.method} ${r.path}`)).toEqual([
      'GET /items',
      'GET /users',
      'POST /users',
    ]);
  });

  it('does not mutate the original array', () => {
    const input: RouteEntry[] = [
      { method: 'POST', path: '/b' },
      { method: 'GET', path: '/a' },
    ];
    sortRoutes(input);
    expect(input[0].path).toBe('/b');
  });
});
