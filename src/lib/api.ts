export const TODOS_KEY = "my_todos";
const ENDPOINT = "https://jsonplaceholder.typicode.com/todos";

// ------------------------------
// Local Storage Helpers
// ------------------------------
export function loadTodos(): Todo[] {
  const data = localStorage.getItem(TODOS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTodos(todos: Todo[]): void {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

// ------------------------------
// Todo Interface
// ------------------------------
export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

// ------------------------------
// Fetch All Todos
// ------------------------------
export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error("Network response was not ok");
  const todos: Todo[] = await res.json();
  saveTodos(todos);
  return todos;
}

// ------------------------------
// Fetch Todo By ID
// ------------------------------
export async function fetchTodoById(id: number): Promise<Todo> {
  const res = await fetch(`${ENDPOINT}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch todo");
  const todo: Todo = await res.json();

  // Update localStorage
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

  const created: Todo = await res.json();
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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update todo");

  const updated: Todo = await res.json();
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
