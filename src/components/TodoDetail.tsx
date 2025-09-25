"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Undo2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchTodoById, updateTodo } from "@/lib/api"; // online-only API

interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

interface Props {
  params: {
    id: string;
  };
}

export default function TodoDetail({ params }: Props) {
  const router = useRouter();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);

  const id = Number(params.id);

  // Fetch todo from server
  useEffect(() => {
    setLoading(true);
    fetchTodoById(id)
      .then((t) => setTodo(t ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!todo) return <div className="p-4">Todo not found.</div>;

  const toggleStatus = async () => {
    const updated = { ...todo, completed: !todo.completed };
    setTodo(updated);

    try {
      await updateTodo(todo.id, { completed: updated.completed });
    } catch (err) {
      console.error("Failed to update status:", err);
      setTodo(todo); // revert on failure
    }
  };

  const isDone = todo.completed;
  const statusIcon = isDone ? (
    <CheckCircle2 className="w-4 h-4" />
  ) : (
    <Circle className="w-4 h-4" />
  );
  const statusText = isDone ? "Completed" : "Incomplete";

  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{todo.title}</CardTitle>
        <Badge
          className={`inline-flex items-center gap-1 ${
            isDone ? "bg-green-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          {statusIcon}
          {statusText}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>ID #{todo.id}</p>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button onClick={toggleStatus} variant="default" className="gap-1">
          <Undo2 className="w-4 h-4" />
          Toggle Status
        </Button>
        <Button
          onClick={() => router.back()}
          variant="default"
          className="gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </CardFooter>
    </Card>
  );
}
