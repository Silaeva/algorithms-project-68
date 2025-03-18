// index.test.js
import serve from "./index.js";

const routes = [
  {
    method: "GET",
    path: "/courses/:id",
    handler: { body: "course!" },
  },
  {
    method: "POST",
    path: "/courses",
    handler: { body: "created!" },
  },
  {
    method: "GET",
    path: "/courses",
    handler: { body: "courses!" },
  },
  {
    method: "PUT",
    path: "/courses/:id",
    handler: { body: "updated!" },
  },
  {
    method: "DELETE",
    path: "/courses/:id",
    handler: { body: "deleted!" },
  },
];

describe("Router Service with HTTP Methods", () => {
  test("returns correct handler for GET /courses", () => {
    const router = serve(routes);
    const result = router.serve({ path: "/courses" });
    expect(result.body).toBe("courses!");
  });

  test("returns correct handler for POST /courses", () => {
    const router = serve(routes);
    const result = router.serve({ path: "/courses", method: "POST" });
    expect(result.body).toBe("created!");
  });

  test("returns correct handler for GET /courses/:id", () => {
    const router = serve(routes);
    const result = router.serve({ path: "/courses/42" });
    expect(result.body).toBe("course!");
    expect(result.params.id).toBe("42");
  });

  test("returns correct handler for PUT /courses/:id", () => {
    const router = serve(routes);
    const result = router.serve({ path: "/courses/42", method: "PUT" });
    expect(result.body).toBe("updated!");
    expect(result.params.id).toBe("42");
  });

  test("returns correct handler for DELETE /courses/:id", () => {
    const router = serve(routes);
    const result = router.serve({ path: "/courses/42", method: "DELETE" });
    expect(result.body).toBe("deleted!");
    expect(result.params.id).toBe("42");
  });

  test("throws error for non-existing route", () => {
    const router = serve(routes);
    expect(() => router.serve({ path: "/no_such_way" })).toThrow("Route not found");
  });

  test("throws error for existing route but wrong method", () => {
    const router = serve(routes);
    expect(() => router.serve({ path: "/courses", method: "DELETE" })).toThrow("Route not found");
  });
});