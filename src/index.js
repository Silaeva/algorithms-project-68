export default function router(routes, request) {
  if (!Array.isArray(routes)) return null;

  const root = Object.create(null);

  const addRoute = (route) => {
    const {
      path,
      handler,
      method = 'GET',
      constraints = {},
    } = route;
    const segments = path.replace(/^\/+/g, '').split('/').filter(Boolean);
    let node = root;

    segments.forEach((segment) => {
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        if (!node.paramChild) {
          node.paramChild = Object.create(null);
        }
        if (!node.paramChild[paramName]) {
          node.paramChild[paramName] = {
            paramName,
            constraint: constraints[paramName],
          };
        }
        node = node.paramChild[paramName];
      } else {
        if (!node.children) {
          node.children = Object.create(null);
        }
        if (!node.children[segment]) {
          node.children[segment] = Object.create(null);
        }
        node = node.children[segment];
      }
    });

    if (!node.handlers) {
      node.handlers = Object.create(null);
    }
    node.handlers[method] = handler;
  };

  routes.forEach(addRoute);

  const serve = ({ path, method = 'GET' }) => {
    const segments = path.replace(/^\/+/g, '').split('/').filter(Boolean);
    const node = root;
    const params = Object.create(null);

    const findRoute = (currentNode, remainingSegments) => {
      if (remainingSegments.length === 0) {
        if (currentNode.handlers && currentNode.handlers[method]) {
          return { handler: currentNode.handlers[method], params };
        }
        return null;
      }

      const [currentSegment, ...restSegments] = remainingSegments;

      if (currentNode.children && currentNode.children[currentSegment]) {
        return findRoute(currentNode.children[currentSegment], restSegments);
      }

      if (currentNode.paramChild) {
        const paramNames = Object.keys(currentNode.paramChild);
        /* eslint-disable-next-line no-plusplus */
        for (let i = 0; i < paramNames.length; i++) {
          const paramName = paramNames[i];
          const paramNode = currentNode.paramChild[paramName];
          const { constraint } = paramNode;

          if (!constraint || new RegExp(constraint).test(currentSegment)) {
            params[paramName] = currentSegment;
            const result = findRoute(paramNode, restSegments);
            if (result) return result;
            delete params[paramName];
          }
        }
      }
      return null;
    };

    const result = findRoute(node, segments);
    if (!result) {
      return { error: `Route not found: ${path} [${method}]` };
    }

    return result;
  };

  return serve(request);
}
