"use client";

const ENDPOINT = "https://jsonplaceholder.typicode.com/todos";

async function safeFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Network error: ${res.status}`);
  return res.json();
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

/** Fetch all todos from server */
export async function fetchTodos(): Promise<Todo[]> {
  return safeFetch(ENDPOINT);
}

/** Fetch single todo by ID from server */
export async function fetchTodoById(id: number): Promise<Todo> {
  return safeFetch(`${ENDPOINT}/${id}`);
}

/** Create new todo on server */
export async function createTodo(data: Partial<Todo>): Promise<Todo> {
  return safeFetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/** Update todo on server */
export async function updateTodo(
  id: number,
  updates: Partial<Todo>
): Promise<Todo> {
  return safeFetch(`${ENDPOINT}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

/** Delete todo on server */
export async function deleteTodo(id: number): Promise<boolean> {
  await fetch(`${ENDPOINT}/${id}`, { method: "DELETE" });
  return true;
}
