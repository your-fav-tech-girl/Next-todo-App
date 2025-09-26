import TodoDetail from "@/components/TodoDetail";

export default async function TodoDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await params; // <-- await here
  return <TodoDetail id={id} />;
}
