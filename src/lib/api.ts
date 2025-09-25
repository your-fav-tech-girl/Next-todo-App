// lib/api.ts

const ENDPOINT = "https://jsonplaceholder.typicode.com/todos";

/**
 * Generic fetch helper with error handling and TypeScript support
 */
async function safeFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...options });
  if (!res.ok) throw new Error(`Network error: ${res.status}`);
  return res.json() as Promise<T>;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

/** Fetch all todos */
export async function fetchTodos(): Promise<Todo[]> {
  return safeFetch<Todo[]>(ENDPOINT);
}

/** Fetch a single todo by ID */
export async function fetchTodoById(id: number): Promise<Todo> {
  return safeFetch<Todo>(`${ENDPOINT}/${id}`);
}

/** Create a new todo */
export async function createTodo(data: Partial<Todo>): Promise<Todo> {
  return safeFetch<Todo>(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/** Update an existing todo */
export async function updateTodo(
  id: number,
  updates: Partial<Todo>
): Promise<Todo> {
  return safeFetch<Todo>(`${ENDPOINT}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

/** Delete a todo */
export async function deleteTodo(id: number): Promise<boolean> {
  const res = await fetch(`${ENDPOINT}/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });
  return res.ok;
}
