export default (routes) => {
  if (!Array.isArray(routes)) {
    throw new TypeError("routes must be an array");
  }

  const root = Object.create(null);

  // Функция для добавления маршрутов
  const addRoute = (route) => {
    const { path, handler, method = "GET", constraints = {} } = route;
    const segments = path.replace(/^\/+/, "").split("/").filter(Boolean);
    let node = root;

    segments.forEach((segment) => {
      if (segment.startsWith(":")) {
        const paramName = segment.slice(1); // Извлекаем имя параметра
        if (!node.paramChild) {
          node.paramChild = Object.create(null);
        }
        if (!node.paramChild[paramName]) {
          node.paramChild[paramName] = { paramName, constraint: constraints[paramName] }; // Ограничения для параметров
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

  // Добавляем маршруты в дерево
  routes.forEach(addRoute);

  // Функция для поиска маршрута
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

      // Проверка на точное совпадение сегмента
      if (currentNode.children && currentNode.children[currentSegment]) {
        const result = findRoute(currentNode.children[currentSegment], restSegments);
        if (result) return result;
      }

      // Проверка параметрического сегмента
      if (currentNode.paramChild) {
        for (const paramName in currentNode.paramChild) {
          const paramNode = currentNode.paramChild[paramName];
          params[paramName] = currentSegment; // Записываем параметр в объект params

          // Применяем ограничение (если оно задано)
          const constraint = paramNode.constraint;
          if (constraint && !new RegExp(`^${constraint}$`).test(currentSegment)) {
            continue; // Пропускаем этот параметр, если не соответствует регулярному выражению
          }

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