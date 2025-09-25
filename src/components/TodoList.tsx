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

  const {
    data: todos = [],
    isLoading,
    isError,
    error,
  } = useQuery<Todo[]>({
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

  const totalPages = Math.ceil(todos.length / PAGE_SIZE);

  // -------------------------------
  // Helper: Update todos in query
  // -------------------------------
  const updateTodos = (callback: (t: Todo) => Todo | null) => {
    queryClient.setQueryData<Todo[]>(
      ["todos"],
      (old: Todo[] | undefined) =>
        (old ?? []).map(callback).filter(Boolean) as Todo[]
    );
  };

  // -------------------------------
  // Add new todo
  // -------------------------------
  const handleAdd = () => {
    if (!newTodo.trim()) return;

    const newItem: Todo = {
      id: Date.now(),
      title: newTodo,
      completed: false,
    };

    queryClient.setQueryData<Todo[]>(["todos"], (old: Todo[] | undefined) => [
      newItem,
      ...(old ?? []),
    ]);

    setNewTodo("");
  };

  // -------------------------------
  // Delete todo
  // -------------------------------
  const handleDelete = (id: number) => {
    queryClient.setQueryData<Todo[]>(["todos"], (old: Todo[] | undefined) =>
      (old ?? []).filter((t: Todo) => t.id !== id)
    );
  };

  // -------------------------------
  // Filter todos
  // -------------------------------
  const filteredTodos = todos
    .filter((t: Todo) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t: Todo) => {
      if (statusFilter === "completed") return t.completed;
      if (statusFilter === "incomplete") return !t.completed;
      return true;
    });

  const currentItems = useMemo(
    () => filteredTodos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredTodos, page]
  );

  // -------------------------------
  // Render
  // -------------------------------
  if (isLoading && todos.length === 0) return <p>Loading…</p>;
  if (isError)
    return <p className="text-red-600">Error: {(error as Error).message}</p>;

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

      {/* Todos List */}
      <ul className="divide-y rounded-lg bg-gray-100 shadow">
        {currentItems.map((todo) => (
          <li
            key={todo.id}
            className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4"
          >
            {/* Left */}
            <div className="flex items-start gap-3 w-full sm:w-auto break-words">
              {todo.completed ? (
                <CheckCircle className="text-green-500 shrink-0 mt-1" />
              ) : (
                <Circle className="text-gray-500 shrink-0 mt-1" />
              )}
              <Link
                href={`/todos/${todo.id}`}
                className={`text-base ${
                  todo.completed ? "line-through opacity-60" : ""
                }`}
              >
                {todo.title}
              </Link>
            </div>

            {/* Right */}
            <div className="flex gap-2 self-end sm:self-auto">
              <Button
                variant="default"
                onClick={() => {
                  setEditingId(todo.id);
                  setEditValue(todo.title);
                }}
              >
                <Pencil className="w-4 h-4 text-green-500" />
              </Button>

              {editingId === todo.id && (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => {
                    updateTodos((t) =>
                      t.id === todo.id ? { ...t, title: editValue } : t
                    );
                    setEditingId(null);
                    setEditValue("");
                  }}
                  className="w-32"
                />
              )}

              <Button variant="default" onClick={() => handleDelete(todo.id)}>
                <TrashIcon className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
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
    </div>
  );
}
