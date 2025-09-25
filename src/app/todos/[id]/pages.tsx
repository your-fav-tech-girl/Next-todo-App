"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { fetchTodoById, updateTodo } from "@/lib/api";

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
  const queryClient = useQueryClient();

  // ✅ Convert param to number safely
  const id = Number(params.id);
  if (isNaN(id)) {
    return <div className="p-4 text-red-600">Invalid Todo ID</div>;
  }

  // ✅ Fetch single todo
  const {
    data: todo,
    isLoading,
    isError,
    error,
  } = useQuery<Todo, Error>({
    queryKey: ["todo", id],
    queryFn: () => fetchTodoById(id),
    retry: false,
  });

  // ✅ Mutation to toggle completed status
  const toggleMutation = useMutation({
    mutationFn: (completed: boolean) => updateTodo(id, { completed }),
    onMutate: async (completed: any) => {
      await queryClient.cancelQueries({ queryKey: ["todo", id] });
      const previous = queryClient.getQueryData<Todo>(["todo", id]);
      if (previous) {
        queryClient.setQueryData(["todo", id], { ...previous, completed });
      }
      return { previous };
    },
    onError: (_err: any, _completed: any, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["todo", id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todo", id] });
    },
  });

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (isError)
    return <div className="p-4 text-red-600">Error: {error.message}</div>;
  if (!todo) return <div className="p-4">Todo not found.</div>;

  const isDone = todo.completed;

  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{todo.title}</CardTitle>
        <Badge
          className={`inline-flex items-center gap-1 ${
            isDone ? "bg-green-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
          {isDone ? "Completed" : "Incomplete"}
        </Badge>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        <p>ID #{todo.id}</p>
        <p>User ID: {todo.userId}</p>
      </CardContent>

      <CardFooter className="flex gap-2 justify-end">
        <Button
          onClick={() => toggleMutation.mutate(!isDone)}
          variant="default"
          className="gap-1"
        >
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
