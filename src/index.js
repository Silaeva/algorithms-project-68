export default (routes) => ({
  serve: (path) => {
    const route = routes.find(route => route.path === path);
    if (!route) {
      throw new Error('Route not found');
    }
    return route.handler;
  }
});