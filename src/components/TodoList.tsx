"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTodos, createTodo, updateTodo, deleteTodo } from "../lib/api";
import { CheckCircle, Circle, Pencil, TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Link from "next/link";

interface Todo {
  id: number;
  userId: number;
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

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filteredTodos = todos
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => {
      if (statusFilter === "completed") return t.completed;
      if (statusFilter === "incomplete") return !t.completed;
      return true;
    });

  const totalPages = Math.max(1, Math.ceil(filteredTodos.length / PAGE_SIZE));
  const currentItems = useMemo(
    () => filteredTodos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredTodos, page]
  );

  // Add new todo
  const handleAdd = async () => {
    if (!newTodo.trim()) return;

    try {
      const serverTodo = await createTodo({
        title: newTodo,
        completed: false,
        userId: 1,
      });
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) => [
        serverTodo,
        ...old,
      ]);
      setNewTodo("");
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  };

  // Edit existing todo
  const handleEdit = async (id: number, title: string) => {
    if (!title.trim()) return;

    const original = todos.find((t) => t.id === id);
    queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
      old.map((t) => (t.id === id ? { ...t, title } : t))
    );

    try {
      await updateTodo(id, { title });
    } catch (err) {
      console.error("Failed to update todo:", err);
      if (original) {
        queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
          old.map((t) => (t.id === id ? original : t))
        );
      }
    } finally {
      setEditingId(null);
      setEditValue("");
    }
  };

  // Delete todo
  const handleDelete = async (id: number) => {
    const original = todos.find((t) => t.id === id);
    queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
      old.filter((t) => t.id !== id)
    );

    try {
      await deleteTodo(id);
    } catch (err) {
      console.error("Failed to delete todo:", err);
      if (original) {
        queryClient.setQueryData<Todo[]>(["todos"], (old = []) => [
          original!,
          ...old,
        ]);
      }
    }
  };

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p className="text-red-600">Error: {error?.message}</p>;

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
          disabled={!newTodo.trim()}
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
      <div>
        {filteredTodos.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No todos found.</p>
        ) : (
          <ul className="divide-y rounded-lg bg-gray-100 shadow">
            {currentItems.map((todo) => (
              <li
                key={todo.id}
                className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4"
              >
                <div className="flex items-start gap-3 w-full sm:w-auto break-words">
                  {todo.completed ? (
                    <CheckCircle className="text-green-500 shrink-0 mt-1" />
                  ) : (
                    <Circle className="text-gray-500 shrink-0 mt-1" />
                  )}

                  {editingId === todo.id ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleEdit(todo.id, editValue)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleEdit(todo.id, editValue)
                      }
                      className="flex-1"
                      autoFocus
                    />
                  ) : (
                    <Link
                      href={`/todos/${todo.id}`}
                      className={`${
                        todo.completed ? "line-through opacity-60" : ""
                      }`}
                    >
                      {todo.title}
                    </Link>
                  )}
                </div>

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

                  <Button
                    variant="default"
                    onClick={() => handleDelete(todo.id)}
                  >
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
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
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
