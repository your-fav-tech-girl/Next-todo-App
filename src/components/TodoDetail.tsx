"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { fetchTodoById, updateTodo, Todo } from "@/lib/api";

interface TodoDetailProps {
  id: string;
}

interface MutationContext {
  previous?: Todo;
}

export default function TodoDetail({ id: idProp }: TodoDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(idProp);

  // Always call hooks, even if id is invalid
  const {
    data: todo,
    isLoading,
    isError,
    error,
  } = useQuery<Todo | undefined, Error>({
    queryKey: ["todo", id],
    queryFn: () => fetchTodoById(id),
    enabled: !isNaN(id), // skip fetching if invalid
    retry: false,
  });

  const toggleMutation = useMutation<Todo, Error, boolean, MutationContext>({
    mutationFn: (completed: boolean) => updateTodo(id, { completed }),
    onMutate: async (completed: boolean) => {
      await queryClient.cancelQueries({ queryKey: ["todo", id] });
      const previous = queryClient.getQueryData<Todo>(["todo", id]);
      if (previous)
        queryClient.setQueryData(["todo", id], { ...previous, completed });
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous)
        queryClient.setQueryData(["todo", id], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todo", id] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // Conditional rendering
  if (isNaN(id)) return <div className="p-4 text-red-600">Invalid Todo ID</div>;
  if (isLoading) return <div className="p-4">Loading…</div>;
  if (isError)
    return <div className="p-4 text-red-600">Error: {error?.message}</div>;
  if (!todo) return <div className="p-4 text-red-600">Todo not found.</div>;

  const isDone = todo.completed;

  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-lg font-semibold">{todo.title}</CardTitle>
        <Badge
          className={`inline-flex items-center gap-1 ${
            isDone
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
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
          disabled={toggleMutation.isPending}
        >
          <Undo2 className="w-4 h-4" />
          {toggleMutation.isPending ? "Updating..." : "Toggle Status"}
        </Button>

        <Button
          onClick={() => router.back()}
          variant="outline"
          className="gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </CardFooter>

      {toggleMutation.isError && (
        <CardFooter className="pt-0">
          <div className="w-full p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error updating todo: {toggleMutation.error?.message}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
