// index.js
export default (routes) => {
  const root = {};

  const addRoute = (method, path, handler) => {
    const segments = path.split('/').filter(Boolean);
    let node = root;

    for (const segment of segments) {
      if (!node.children) {
        node.children = {};
      }

      if (segment.startsWith(':')) {
        if (!node.paramChild) {
          node.paramChild = { paramName: segment.slice(1) };
        }
        node = node.paramChild;
      } else {
        if (!node.children[segment]) {
          node.children[segment] = {};
        }
        node = node.children[segment];
      }
    }

    if (!node.handlers) {
      node.handlers = {};
    }
    node.handlers[method] = handler;
  };

  routes.forEach(({ method = 'GET', path, handler }) => addRoute(method, path, handler));

  const serve = ({ path, method = 'GET' }) => {
    const segments = path.split('/').filter(Boolean);
    let node = root;
    const params = {};

    const findRoute = (currentNode, remainingSegments) => {
      if (remainingSegments.length === 0) {
        return currentNode.handlers && currentNode.handlers[method]
          ? { handler: currentNode.handlers[method], params }
          : null;
      }

      const [currentSegment, ...restSegments] = remainingSegments;

      if (currentNode.children && currentNode.children[currentSegment]) {
        const result = findRoute(currentNode.children[currentSegment], restSegments);
        if (result) return result;
      }

      if (currentNode.paramChild) {
        params[currentNode.paramChild.paramName] = currentSegment;
        const result = findRoute(currentNode.paramChild, restSegments);
        if (result) return result;
        delete params[currentNode.paramChild.paramName];
      }

      return null;
    };

    const result = findRoute(node, segments);

    if (!result) {
      throw new Error('Route not found');
    }

    return {
      ...result.handler,
      method,
      path,
      params,
    };
  };

  return { serve };
};
