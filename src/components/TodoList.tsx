"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTodos, loadTodosOffline, Todo } from "@/lib/api";
import { CheckCircle, Circle, Pencil, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function TodoList() {
  const queryClient = useQueryClient();

  const {
    data: todos = [],
    isLoading,
    isError,
    error,
  } = useQuery<Todo[], Error>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    initialData: [],
  });

  // Load offline todos once on mount if online fetch fails
  useEffect(() => {
    if (todos.length === 0) {
      loadTodosOffline().then((offlineTodos) => {
        queryClient.setQueryData<Todo[]>(["todos"], offlineTodos ?? []);
      });
    }
  }, [queryClient, todos.length]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "incomplete"
  >("all");
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => setPage(1), [search, statusFilter]);

  const updateTodos = (callback: (todos: Todo[]) => Todo[]) => {
    queryClient.setQueryData<Todo[]>(["todos"], (old = []) => callback(old));
  };

  const handleAdd = () => {
    if (!newTodo.trim()) return;
    const newItem: Todo = {
      id: Date.now(),
      title: newTodo.trim(),
      completed: false,
      userId: 0,
    };
    updateTodos((old) => [newItem, ...old]);
    setNewTodo("");
  };

  const handleDelete = (id: number) =>
    updateTodos((old) => old.filter((t) => t.id !== id));
  const handleToggle = (id: number) =>
    updateTodos((old) =>
      old.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  const handleEdit = (id: number, newTitle: string) => {
    if (!newTitle.trim()) return;
    updateTodos((old) =>
      old.map((t) => (t.id === id ? { ...t, title: newTitle.trim() } : t))
    );
    setEditingId(null);
    setEditValue("");
  };

  const filteredTodos = useMemo(() => {
    const list = todos ?? [];
    return list.filter((todo) => {
      const matchesSearch = todo.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "completed"
          ? todo.completed
          : statusFilter === "incomplete"
          ? !todo.completed
          : true;
      return matchesSearch && matchesStatus;
    });
  }, [todos, search, statusFilter]);

  const totalPages = Math.ceil(filteredTodos.length / PAGE_SIZE);
  const currentItems = useMemo(
    () => filteredTodos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredTodos, page]
  );

  if (isLoading) return <p className="p-4">Loading…</p>;
  if (isError)
    return <p className="p-4 text-red-600">Error: {error?.message}</p>;

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
          className="bg-green-500 text-white hover:bg-green-600"
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
      {currentItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No todos found.</div>
      ) : (
        <ul className="divide-y rounded-lg bg-gray-100 shadow">
          {currentItems.map((todo) => (
            <li
              key={todo.id}
              className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4"
            >
              <div className="flex items-start gap-3 w-full sm:w-auto break-words">
                <button
                  onClick={() => handleToggle(todo.id)}
                  className="shrink-0 mt-1"
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
                      if (e.key === "Enter") handleEdit(todo.id, editValue);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => handleEdit(todo.id, editValue)}
                    className="flex-1"
                    autoFocus
                  />
                ) : (
                  <Link
                    href={`/todos/${todo.id}`}
                    className={todo.completed ? "line-through opacity-60" : ""}
                  >
                    {todo.title}
                  </Link>
                )}
              </div>

              <div className="flex gap-2 self-end sm:self-auto">
                {editingId === todo.id ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(todo.id, editValue)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingId(todo.id);
                        setEditValue(todo.title);
                      }}
                    >
                      <Pencil className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(todo.id)}
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
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
