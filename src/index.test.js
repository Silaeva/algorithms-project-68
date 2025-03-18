import serve from './index.js';

const routes = [
  {
    path: '/courses',
    handler: {
      body: 'courses'
    },
  },
  {
    path: '/courses/basics',
    handler: {
      body: 'basics'
    },
  },
];

const path = '/courses';

describe('Router Service', () => {
  test('returns correct handler for existing route', () => {
    const router = serve(routes);
    expect(router.serve('/courses').body).toBe('courses');
    expect(router.serve('/courses/basics').body).toBe('basics');
  });

  test('throws error for non-existing route', () => {
    const router = serve(routes);
    expect(() => router.serve('/no_such_way')).toThrow('Route not found');
  });
});
