"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTodos } from "@/lib/api";
import { CheckCircle, Circle, Pencil, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const PAGE_SIZE = 10;

export default function TodoList() {
  const queryClient = useQueryClient();

  // Fetch todos
  const {
    data: todos = [],
    isLoading,
    isError,
    error,
  } = useQuery<Todo[], Error>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "incomplete"
  >("all");
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // -------------------------------
  // Filter and paginate todos
  // -------------------------------
  const filteredTodos = useMemo(() => {
    return todos
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => {
        if (statusFilter === "completed") return t.completed;
        if (statusFilter === "incomplete") return !t.completed;
        return true;
      });
  }, [todos, search, statusFilter]);

  const totalPages = Math.ceil(filteredTodos.length / PAGE_SIZE);

  const currentItems = useMemo(
    () => filteredTodos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredTodos, page]
  );

  // Reset to page 1 when filters change
  useMemo(() => {
    setPage(1);
  }, [search, statusFilter]);

  // -------------------------------
  // Helper: Update todos in query
  // -------------------------------
  const updateTodos = (callback: (todos: Todo[]) => Todo[]) => {
    queryClient.setQueryData<Todo[]>(["todos"], (old = []) => callback(old));
  };

  // -------------------------------
  // Add new todo
  // -------------------------------
  const handleAdd = () => {
    if (!newTodo.trim()) return;

    const newItem: Todo = {
      id: Date.now(),
      title: newTodo.trim(),
      completed: false,
    };

    updateTodos((old) => [newItem, ...old]);
    setNewTodo("");
  };

  // -------------------------------
  // Toggle todo completion
  // -------------------------------
  const handleToggle = (id: number) => {
    updateTodos((old) =>
      old.map((t: Todo) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // -------------------------------
  // Delete todo
  // -------------------------------
  const handleDelete = (id: number) => {
    updateTodos((old) => old.filter((t) => t.id !== id));
  };

  // -------------------------------
  // Edit todo
  // -------------------------------
  const handleEdit = (id: number, newTitle: string) => {
    if (!newTitle.trim()) return;

    updateTodos((old) =>
      old.map((t) => (t.id === id ? { ...t, title: newTitle.trim() } : t))
    );
    setEditingId(null);
    setEditValue("");
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditValue(todo.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // -------------------------------
  // Render
  // -------------------------------
  if (isLoading && todos.length === 0) return <p className="p-4">Loading…</p>;
  if (isError)
    return <p className="p-4 text-red-600">Error: {error.message}</p>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Search & Add */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Input
          placeholder="Search todos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Add new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1"
        />
        <Button
          className="bg-green-500 text-white hover:bg-green-600 whitespace-nowrap"
          onClick={handleAdd}
          disabled={!newTodo.trim()}
        >
          Add
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 justify-start">
        {(["all", "completed", "incomplete"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {currentItems.length} of {filteredTodos.length} todos
        {search && ` (filtered by "${search}")`}
      </div>

      {/* Todos List */}
      {currentItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {todos.length === 0
            ? "No todos yet. Add one above!"
            : "No todos match your filters."}
        </div>
      ) : (
        <ul className="divide-y rounded-lg bg-gray-100 shadow">
          {currentItems.map((todo) => (
            <li
              key={todo.id}
              className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4"
            >
              {/* Left */}
              <div className="flex items-start gap-3 w-full sm:w-auto break-words">
                <button
                  onClick={() => handleToggle(todo.id)}
                  className="shrink-0 mt-1 hover:opacity-75"
                >
                  {todo.completed ? (
                    <CheckCircle className="text-green-500" />
                  ) : (
                    <Circle className="text-gray-500" />
                  )}
                </button>

                {editingId === todo.id ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleEdit(todo.id, editValue);
                      } else if (e.key === "Escape") {
                        cancelEdit();
                      }
                    }}
                    onBlur={() => handleEdit(todo.id, editValue)}
                    className="flex-1"
                    autoFocus
                  />
                ) : (
                  <Link
                    href={`/todos/${todo.id}`}
                    className={`text-base hover:underline ${
                      todo.completed ? "line-through opacity-60" : ""
                    }`}
                  >
                    {todo.title}
                  </Link>
                )}
              </div>

              {/* Right */}
              <div className="flex gap-2 self-end sm:self-auto">
                {editingId === todo.id ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(todo.id, editValue)}
                    >
                      Save
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => startEdit(todo)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(todo.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground text-center">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
