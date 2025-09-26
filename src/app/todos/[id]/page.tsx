import TodoDetail from "@/components/TodoDetail";

interface Props {
  params: {
    id: string;
  };
}

// Mark the page as async
export default async function TodoDetailPage({ params }: Props) {
  return <TodoDetail id={params.id} />;
}
