export default (routes) => {
  const root = Object.create(null);

  const addRoute = (route) => {
    const { path, handler, method = 'GET', constraints = {} } = route; // Добавляем constraints
    const segments = path.replace(/^\/+/, "").split("/").filter(Boolean); // Разделяем путь на сегменты
    let node = root;

    segments.forEach((segment) => {
      // Если сегмент динамический (например, :id), создаем отдельный узел
      if (segment.startsWith(":")) {
        const paramName = segment.slice(1); // Извлекаем имя параметра
        if (!node.paramChild) {
          node.paramChild = Object.create(null);
        }
        if (!node.paramChild[paramName]) {
          node.paramChild[paramName] = { paramName, constraint: constraints[paramName] }; // Добавляем ограничение
        }
        node = node.paramChild[paramName];
      } else {
        // Для статического сегмента создаем соответствующий дочерний узел
        if (!node.children) {
          node.children = Object.create(null);
        }
        if (!node.children[segment]) {
          node.children[segment] = Object.create(null);
        }
        node = node.children[segment];
      }
    });

    // Добавляем обработчик с учетом метода
    if (!node.handlers) {
      node.handlers = Object.create(null);
    }
    node.handlers[method] = handler;
  };

  // Добавляем все маршруты в префиксное дерево
  routes.forEach(addRoute);

  // Функция для поиска маршрута в префиксном дереве с учетом метода
  const serve = ({ path, method = 'GET' }) => {
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
          params[paramName] = currentSegment; // Записываем параметр в объект params

          // Проверка ограничения (регулярного выражения)
          if (paramNode.constraint && !new RegExp(paramNode.constraint).test(currentSegment)) {
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