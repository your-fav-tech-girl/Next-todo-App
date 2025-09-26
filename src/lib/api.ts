"use client";

const ENDPOINT = "https://jsonplaceholder.typicode.com/todos";
const TODOS_KEY = "todos";

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

// ------------------------------
// Local Storage Helpers
// ------------------------------
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadTodos(): Todo[] {
  if (!isBrowser()) return []; // SSR-safe
  try {
    const data = localStorage.getItem(TODOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to load todos from localStorage:", err);
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (err) {
    console.error("Failed to save todos to localStorage:", err);
  }
}

// ------------------------------
// Fetch All Todos
// ------------------------------
export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch todos");

  const todos = (await res.json()) as Todo[];

  // ✅ Sync with localStorage
  saveTodos(todos);

  return todos;
}

// ------------------------------
// Fetch Todo By ID
// ------------------------------
export async function fetchTodoById(id: number): Promise<Todo> {
  const res = await fetch(`${ENDPOINT}/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch todo");

  const todo = (await res.json()) as Todo;

  // ✅ Update localStorage with this item
  const updatedTodos = [...loadTodos().filter((t) => t.id !== todo.id), todo];
  saveTodos(updatedTodos);

  return todo;
}

// ------------------------------
// Create Todo
// ------------------------------
export interface CreateTodoData {
  userId: number;
  title: string;
  completed: boolean;
}

export async function createTodo(data: CreateTodoData): Promise<Todo> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create todo");

  const created = (await res.json()) as Todo;

  // ✅ Save to localStorage (prepend for UX)
  saveTodos([created, ...loadTodos()]);

  return created;
}

// ------------------------------
// Update Todo
// ------------------------------
export interface UpdateTodoData {
  title?: string;
  completed?: boolean;
  userId?: number;
}

export async function updateTodo(
  id: number,
  updates: UpdateTodoData
): Promise<Todo> {
  const res = await fetch(`${ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update todo");

  const updated = (await res.json()) as Todo;

  // ✅ Replace in localStorage
  const next = loadTodos().map((t) => (t.id === id ? updated : t));
  saveTodos(next);

  return updated;
}

// ------------------------------
// Delete Todo
// ------------------------------
export async function deleteTodo(id: number): Promise<{ success: boolean }> {
  const res = await fetch(`${ENDPOINT}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete todo");

  // ✅ Remove from localStorage
  const remaining = loadTodos().filter((t) => t.id !== id);
  saveTodos(remaining);

  return { success: true };
}
