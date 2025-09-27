"use client";

import Dexie from "dexie";

const ENDPOINT = "https://jsonplaceholder.typicode.com/todos";

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export interface CreateTodoData {
  userId: number;
  title: string;
  completed: boolean;
}

export interface UpdateTodoData {
  title?: string;
  completed?: boolean;
  userId?: number;
}

// Dexie DB Setup
export class TodoDB extends Dexie {
  todos!: Dexie.Table<Todo, number>;

  constructor() {
    super("TodoDB");
    this.version(1).stores({
      todos: "++id,userId,title,completed",
    });
  }
}

export const db = new TodoDB();

const isBrowser = (): boolean => typeof window !== "undefined";

export async function loadTodosOffline(): Promise<Todo[]> {
  if (!isBrowser()) return [];
  return await db.todos.toArray();
}

export async function fetchTodos(): Promise<Todo[]> {
  try {
    const res = await fetch(ENDPOINT, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch todos");

    const todos: Todo[] = await res.json();

    if (isBrowser()) {
      await db.todos.clear();
      await db.todos.bulkAdd(todos);
    }

    return todos;
  } catch (_err) {
    return loadTodosOffline();
  }
}

export async function fetchTodoById(id: number): Promise<Todo | undefined> {
  try {
    const res = await fetch(`${ENDPOINT}/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch todo");

    const todo: Todo = await res.json();

    if (isBrowser()) await db.todos.put(todo);

    return todo;
  } catch (_err) {
    return isBrowser() ? db.todos.get(id) : undefined;
  }
}


// Create Todo
export async function createTodo(data: CreateTodoData): Promise<Todo> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create todo");

    const created: Todo = await res.json();

    if (isBrowser()) await db.todos.add(created);

    return created;
  } catch (_err) {
    // Offline fallback: create locally with temp ID
    const tempId = Date.now();
    const offlineTodo: Todo = { id: tempId, ...data };
    if (isBrowser()) await db.todos.add(offlineTodo);
    return offlineTodo;
  }
}


// Update Todo

export async function updateTodo(
  id: number,
  updates: UpdateTodoData
): Promise<Todo> {
  try {
    const res = await fetch(`${ENDPOINT}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update todo");

    const updated: Todo = await res.json();

    if (isBrowser()) await db.todos.put(updated);

    return updated;
  } catch (err) {
    // Offline update: modify local copy
    if (!isBrowser()) throw err;
    const existing = await db.todos.get(id);
    if (!existing) throw err;
    const updated: Todo = { ...existing, ...updates };
    await db.todos.put(updated);
    return updated;
  }
}


// Delete Todo

export async function deleteTodo(id: number): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${ENDPOINT}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete todo");

    if (isBrowser()) await db.todos.delete(id);
    return { success: true };
  } catch (_err) {
    // Offline delete: remove locally
    if (isBrowser()) await db.todos.delete(id);
    return { success: true };
  }
}

/*"use client";

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
*/
