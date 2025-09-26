const ENDPOINT = "https://jsonplaceholder.typicode.com/todos";
const TODOS_KEY = "todos";

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

//
// Local Storage Helpers
//
export function loadTodos(): Todo[] {
  if (typeof window === "undefined") return []; //SSR
  const data = localStorage.getItem(TODOS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

// ------------------------------
// Fetch All Todos
// ------------------------------
export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error("Network response was not ok");
  const todos = (await res.json()) as Todo[];
  saveTodos(todos);
  return todos;
}

// ------------------------------
// Fetch Todo By ID
// ------------------------------
export async function fetchTodoById(id: number): Promise<Todo> {
  const res = await fetch(`${ENDPOINT}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch todo");
  const todo = (await res.json()) as Todo;

  // ✅ Sync localStorage
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
    method: "PATCH", // ✅ safer for partial updates
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update todo");

  const updated = (await res.json()) as Todo;
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

  saveTodos(loadTodos().filter((t) => t.id !== id));
  return { success: true };
}
