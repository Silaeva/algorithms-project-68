import makeRouter from "../src/index.js"; // Убедись, что путь к файлу правильный

describe("Router", () => {
  let router;

  beforeEach(() => {
    const routes = [
      { path: "/home", handler: { body: "home!" } },
      { path: "/users/:id", handler: { body: "user profile" } },
      {
        path: "/posts/:postId",
        handler: { body: "post details" },
        constraints: { postId: "\\d+" }, // Только числа
      },
      {
        path: "/api/data",
        method: "POST",
        handler: { body: "data saved" },
      },
    ];
    router = makeRouter(routes);
  });

  test("Статический маршрут", () => {
    const result = router.serve({ path: "/home", method: "GET" });
    expect(result.handler.body).toBe("home!");
  });

  test("Динамический маршрут", () => {
    const result = router.serve({ path: "/users/42", method: "GET" });
    expect(result.handler.body).toBe("user profile");
    expect(result.params).toEqual({ id: "42" });
  });

  test("Ограничение параметров (constraints)", () => {
    expect(() => router.serve({ path: "/posts/abc", method: "GET" })).toThrow(
      "Route not found: /posts/abc [GET]"
    );

    const result = router.serve({ path: "/posts/123", method: "GET" });
    expect(result.handler.body).toBe("post details");
    expect(result.params).toEqual({ postId: "123" });
  });

  test("Методы HTTP (POST)", () => {
    expect(() => router.serve({ path: "/api/data", method: "GET" })).toThrow(
      "Route not found: /api/data [GET]"
    );

    const result = router.serve({ path: "/api/data", method: "POST" });
    expect(result.handler.body).toBe("data saved");
  });

  test("Неизвестный маршрут", () => {
    expect(() => router.serve({ path: "/unknown", method: "GET" })).toThrow(
      "Route not found: /unknown [GET]"
    );
  });
});