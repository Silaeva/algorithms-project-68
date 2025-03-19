const createRouter = (routes) => {
  // Создаем префиксное дерево
  const buildTrie = (routes) => {
    const trie = {};

    routes.forEach((route) => {
      const method = route.method || 'GET'; // По умолчанию метод GET
      const segments = route.path.split('/').filter(Boolean); // Разделяем путь на сегменты
      let currentNode = trie;

      // Создаем узел для метода, если его нет
      if (!currentNode[method]) {
        currentNode[method] = {};
      }
      currentNode = currentNode[method];

      segments.forEach((segment) => {
        // Если сегмент динамический (начинается с :)
        if (segment.startsWith(':')) {
          const paramName = segment.slice(1); // Имя параметра
          const constraint = route.constraints?.[paramName]; // Ограничение для параметра

          if (!currentNode[':dynamic']) {
            currentNode[':dynamic'] = {};
          }
          currentNode = currentNode[':dynamic'];
          currentNode.paramName = paramName; // Сохраняем имя параметра
          currentNode.constraint = constraint; // Сохраняем ограничение
        } else {
          if (!currentNode[segment]) {
            currentNode[segment] = {};
          }
          currentNode = currentNode[segment];
        }
      });

      // Сохраняем обработчик в конечном узле
      currentNode.handler = route.handler;
    });

    return trie;
  };

  const trie = buildTrie(routes);

  // Проверка ограничения для динамического сегмента
  const checkConstraint = (value, constraint) => {
    if (!constraint) return true; // Если ограничение не задано, пропускаем проверку
    const regex = new RegExp(`^${constraint}$`);
    return regex.test(value);
  };

  // Поиск в префиксном дереве
  const findInTrie = (method, path) => {
    const segments = path.split('/').filter(Boolean); // Разделяем путь на сегменты
    let currentNode = trie[method]; // Начинаем поиск с узла для указанного метода

    if (!currentNode) {
      return null; // Если метод не найден, возвращаем null
    }

    const params = {};

    for (const segment of segments) {
      if (currentNode[segment]) {
        // Если есть статический сегмент, переходим к нему
        currentNode = currentNode[segment];
      } else if (currentNode[':dynamic']) {
        // Если есть динамический сегмент, проверяем ограничение
        const paramName = currentNode[':dynamic'].paramName;
        const constraint = currentNode[':dynamic'].constraint;

        if (!checkConstraint(segment, constraint)) {
          return null; // Ограничение не выполнено
        }

        params[paramName] = segment; // Сохраняем значение параметра
        currentNode = currentNode[':dynamic'];
      } else {
        // Если сегмент не найден, маршрут не существует
        return null;
      }
    }

    // Если найден обработчик, возвращаем его и параметры
    if (currentNode.handler) {
      return {
        handler: currentNode.handler,
        params,
      };
    }

    return null;
  };

  return {
    serve(request) {
      const { method = 'GET', path } = request; // По умолчанию метод GET
      const result = findInTrie(method, path);

      if (!result) {
        throw new Error(`Route not found: ${method} ${path}`);
      }

      return {
        path,
        method,
        handler: result.handler,
        params: result.params,
      };
    },
  };
};

export default createRouter;