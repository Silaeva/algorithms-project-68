// @ts-check

import serve from "../src/index.js";
import { describe, expect, test } from "vitest";

const routes = [
  {
    method: "GET",
    path: "/courses/:id",
    handler: {
      body: "course!",
    },
  },
  {
    method: "POST",
    path: "/courses",
    handler: {
      body: "created!",
    },
  },
  {
    method: "GET",
    path: "/courses",
    handler: {
      body: "courses!",
    },
  },
  {
    path: "/courses/:course_id/exercises/:id",
    handler: {
      body: "exercise!",
    },
    constraints: { id: "\\d+", course_id: "^[a-z]+$" },
  },
];

describe("Router Service with Prefix Tree", () => {
  test("returns correct handler for existing static route", () => {
    const router = serve(routes);
    expect(router.serve({ path: "/courses", method: "GET" }).body).toBe(
      "courses!"
    );
  });

  test("returns correct handler and params for dynamic route", () => {
    const router = serve(routes);
    const result = router.serve({ path: "/courses/php_trees", method: "GET" });
    expect(result.body).toBe("course!");
    expect(result.params.id).toBe("php_trees");
  });

  test("returns correct handler for POST method", () => {
    const router = serve(routes);
    const result = router.serve({ path: "/courses", method: "POST" });
    expect(result.body).toBe("created!");
  });

  test("returns correct handler and params for nested dynamic route with constraints", () => {
    const router = serve(routes);
    const result = router.serve({
      path: "/courses/js/exercises/1",
      method: "GET",
    });
    expect(result.body).toBe("exercise!");
    expect(result.params.course_id).toBe("js");
    expect(result.params.id).toBe("1");
  });

  test("throws error for constraint violation", () => {
    const router = serve(routes);
    expect(() =>
      router.serve({ path: "/courses/123/exercises/js", method: "GET" })
    ).toThrow("Route not found");
  });

  test("throws error for non-existing route", () => {
    const router = serve(routes);
    expect(() => router.serve({ path: "/no_such_way", method: "GET" })).toThrow(
      "Route not found"
    );
  });
});
