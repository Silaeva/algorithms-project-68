export default (routes) => ({
  serve: (path) => {
    for (const route of routes) {
      const regex = new RegExp('^' + route.path.replace(/:([a-zA-Z0-9_]+)/g, '([^/]+)') + '$');
      const match = path.match(regex);

      if (match) {
        const params = {};
        const keys = route.path.match(/:([a-zA-Z0-9_]+)/g);

        if (keys) {
          keys.forEach((key, index) => {
            params[key.slice(1)] = match[index + 1];
          });
        }

        return {
          ...route.handler,
          params,
        };
      }
    }

    throw new Error('Route not found');
  }
});