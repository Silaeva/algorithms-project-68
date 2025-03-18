// index.test.js
import serve from "./index.js";

const routes = [
  {
    path: "/courses",
    handler: {
      body: "courses",
    },
  },
  {
    path: "/courses/:id",
    handler: {
      body: "course",
    },
  },
  {
    path: "/courses/:course_id/exercises/:id",
    handler: {
      body: "exercise",
    },
  },
];

describe("Router Service", () => {
  test("returns correct handler for existing static route", () => {
    const router = serve(routes);
    expect(router.serve("/courses").body).toBe("courses");
    expect(router.serve("/courses/basics").body).toBe("course");
  });

  test("returns correct handler and params for dynamic route", () => {
    const router = serve(routes);
    const result = router.serve("/courses/php_trees");
    expect(result.body).toBe("course");
    expect(result.params.id).toBe("php_trees");
  });

  test("returns correct handler and params for nested dynamic route", () => {
    const router = serve(routes);
    const result = router.serve("/courses/js_react/exercises/1");
    expect(result.body).toBe("exercise");
    expect(result.params.course_id).toBe("js_react");
    expect(result.params.id).toBe("1");
  });

  test("throws error for non-existing route", () => {
    const router = serve(routes);
    expect(() => router.serve("/no_such_way")).toThrow("Route not found");
  });
});
