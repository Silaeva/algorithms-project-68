export default (routes) => {
  const root = Object.create(null);

  const addRoute = (route) => {
    const { path, handler, method = "GET", constraints = {} } = route;
    const segments = path.replace(/^\/+/, "").split("/").filter(Boolean); // Убираем начальные "/"
    let node = root;

    for (const segment of segments) {
      if (!node.children) {
        node.children = Object.create(null);
      }

      if (segment.startsWith(":")) {
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
        if (!node.children[segment]) {
          node.children[segment] = Object.create(null);
        }
        node = node.children[segment];
      }
    }

    if (!node.handlers) {
      node.handlers = Object.create(null);
    }
    node.handlers[method] = handler;
  };

  routes.forEach(addRoute);

  const serve = ({ path, method = "GET" }) => {
    const segments = path.replace(/^\/+/, "").split("/").filter(Boolean);
    let node = root;
    const params = Object.create(null);

    const findRoute = (currentNode, remainingSegments) => {
      if (remainingSegments.length === 0) {
        if (currentNode.handlers && currentNode.handlers[method]) {
          return { handler: currentNode.handlers[method], params };
        }
        return null;
      }

      const [currentSegment, ...restSegments] = remainingSegments;

      // Проверяем точное совпадение сегмента
      if (currentNode.children && currentNode.children[currentSegment]) {
        const result = findRoute(
          currentNode.children[currentSegment],
          restSegments
        );
        if (result) return result;
      }

      // Проверяем параметрический маршрут
      if (currentNode.paramChild) {
        for (const paramName in currentNode.paramChild) {
          const paramNode = currentNode.paramChild[paramName];
          if (
            paramNode.constraint &&
            !new RegExp(`^${paramNode.constraint}$`).test(currentSegment)
          ) {
            continue;
          }
          params[paramName] = currentSegment;
          const result = findRoute(paramNode, restSegments);
          if (result) return result;
          delete params[paramName];
        }
      }

      return null;
    };

    const result = findRoute(node, segments);
    if (!result) {
      throw new Error(`Route not found: ${path} [${method}]`);
    }

    return { handler: result.handler, params };
  };

  return { serve };
};
