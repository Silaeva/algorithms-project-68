import serve from "./index.js";

const routes = [
  {
    path: "/users/long/:id",
    method: "POST",
    handler: {
      body: "handler1",
    },
  },
  {
    path: "/users/long/:way",
    method: "GET",
    handler: {
      body: "handler2",
    },
  },
  {
    path: "/api/id/:name",
    method: "GET",
    handler: {
      body: "handler4",
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

const result = serve({
  path: "/users/long/1",
  method: "POST",
  routes: routes, // Передаем маршруты
});
console.log(result.handler.body); // handler1

const result2 = serve({
  path: "/courses/js/exercises/1",
  method: "GET",
  routes: routes, // Передаем маршруты
});
console.log(result2.handler.body); // exercise!