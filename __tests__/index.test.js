import router from '../src/index'; // Путь к файлу с вашим роутером

describe('Router', () => {
  let routes;

  beforeEach(() => {
    // Дефолтные маршруты для тестирования
    routes = [
      { path: "/home", handler: { body: "home!" } },
      { path: "/users/:id", handler: { body: "user profile" } },
      {
        path: "/posts/:postId",
        handler: { body: "post details" },
        constraints: { postId: "\\d+" }, // Только числа
      },
      {
        path: "/api/data",
        method: "POST",
        handler: { body: "data saved" },
      },
    ];
  });

  test('Статический маршрут', () => {
    const request = { path: '/home', method: 'GET' };
    const result = router(routes, request);
    expect(result.handler.body).toBe('home!');
  });

  test('Динамический маршрут', () => {
    const request = { path: '/users/42', method: 'GET' };
    const result = router(routes, request);
    expect(result.handler.body).toBe('user profile');
    expect(result.params).toEqual({ id: '42' });
  });

  test('Ограничение параметров (constraints)', () => {
    const request1 = { path: '/posts/abc', method: 'GET' };
    expect(() => router(routes, request1)).toThrow('Route not found: /posts/abc [GET]');

    const request2 = { path: '/posts/123', method: 'GET' };
    const result2 = router(routes, request2);
    expect(result2.handler.body).toBe('post details');
    expect(result2.params).toEqual({ postId: '123' });
  });

  test('Методы HTTP (POST)', () => {
    const request1 = { path: '/api/data', method: 'GET' };
    expect(() => router(routes, request1)).toThrow('Route not found: /api/data [GET]');

    const request2 = { path: '/api/data', method: 'POST' };
    const result2 = router(routes, request2);
    expect(result2.handler.body).toBe('data saved');
  });

  test('Неизвестный маршрут', () => {
    const request = { path: '/unknown', method: 'GET' };
    expect(() => router(routes, request)).toThrow('Route not found: /unknown [GET]');
  });

  test('Проверка на то, что переданный маршрут не является массивом', () => {
    expect(() => router({}, { path: '/home', method: 'GET' })).toThrow('routes must be an array');
  });
});