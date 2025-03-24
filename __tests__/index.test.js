import solution from '../src/index.js';

const routes = [
  {
    method: 'POST',
    path: 'users/long/:id',
    handler: {
      body: 'handler1',
    },
    constraints: { id: '\\d+' },
  },
  {
    path: 'users/long/:way',
    handler: {
      body: 'handler2',
    },
    constraints: { way: '[a-z]' },
  },
  {
    path: 'users/long/way/:name',
    handler: {
      body: 'handler3',
    },
    constraints: { name: '[a-z]+' },
  },
  {
    path: 'api/:id/:name/risc-v',
    handler: {
      body: 'handler4',
    },
    constraints: { id: '.', name: '^[a-z]+$' },
  },
  {
    method: 'PUT',
    path: 'api/:id/:uid',
    handler: {
      body: 'handler5',
    },
  },
  {
    path: 'api/to/Japan/',
    handler: {
      body: 'handler6',
    },
  },
  {
    path: '/',
    handler: {
      body: 'root',
    },
  },
  {
    path: '/courses/:course_id/exercises/:id',
    handler: {
      body: 'exercise!',
    },
    constraints: { id: '\\d+', course_id: '^[a-z]+$' },
  },
];

describe('makeRoutes positive', () => {
  test.each([
    [{ path: 'users/long/1', method: 'POST' }, { params: { id: '1' } }, 'handler1'],
    [{ path: 'users/long/a' }, { params: { way: 'a' } }, 'handler2'],
    [{ path: 'users/long/way/to' }, { params: { name: 'to' } }, 'handler3'],
    [{ path: 'api/id/names/risc-v' }, { params: { id: 'id', name: 'names' } }, 'handler4'],
    [{ path: 'api/v1/Risc/', method: 'PUT' }, { params: { id: 'v1', uid: 'Risc' } }, 'handler5'],
    [{ path: 'api/to/Japan/' }, { params: {} }, 'handler6'],
    [{ path: '/' }, { params: {} }, 'root'],
    [{ path: '/courses/js/exercises/1' }, { params: { id: '1', course_id: 'js' } }, 'exercise!'],
  ])('route - %j; expected params - %j; expected call handler - %s', async (route, expected, handler) => {
    const result = await solution(routes, route);
    expect(result).toMatchObject(expected);
    expect(result.handler.body).toEqual(handler);
  });
});
