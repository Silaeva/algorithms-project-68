export default (routes) => {
  const root = {};

  // Функция для добавления маршрута в дерево
  const addRoute = (path, handler) => {
    const segments = path.split("/").filter(Boolean);
    let node = root;

    for (const segment of segments) {
      if (!node.children) {
        node.children = {};
      }

      if (segment.startsWith(":")) {
        // Динамический сегмент
        if (!node.paramChildren) {
          node.paramChildren = [];
        }
        const paramName = segment.slice(1);
        const paramNode = { paramName, children: {} };
        node.paramChildren.push(paramNode);
        node = paramNode;
      } else {
        // Статический сегмент
        if (!node.children[segment]) {
          node.children[segment] = {};
        }
        node = node.children[segment];
      }
    }

    // Сохраняем обработчик в конечном узле
    node.handler = handler;
  };

  // Добавляем все маршруты в дерево
  routes.forEach((route) => addRoute(route.path, route.handler));

  // Функция для поиска маршрута
  const serve = (path) => {
    const segments = path.split("/").filter(Boolean);
    let node = root;
    const params = {};

    const findRoute = (currentNode, remainingSegments, params) => {
      if (remainingSegments.length === 0) {
        return currentNode.handler
          ? { handler: currentNode.handler, params }
          : null;
      }

      const [currentSegment, ...restSegments] = remainingSegments;

      // Проверяем статические сегменты
      if (currentNode.children && currentNode.children[currentSegment]) {
        const result = findRoute(
          currentNode.children[currentSegment],
          restSegments,
          params
        );
        if (result) return result;
      }

      // Проверяем динамические сегменты
      if (currentNode.paramChildren) {
        for (const paramNode of currentNode.paramChildren) {
          params[paramNode.paramName] = currentSegment;
          const result = findRoute(paramNode, restSegments, params);
          if (result) return result;
          delete params[paramNode.paramName]; // Откатываем параметр, если маршрут не найден
        }
      }

      return null;
    };

    const result = findRoute(node, segments, params);

    if (!result) {
      throw new Error("Route not found");
    }

    return {
      ...result.handler,
      params,
    };
  };

  return { serve };
};