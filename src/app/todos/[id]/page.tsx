import TodoDetail from "@/components/TodoDetail";

interface Props {
  params: {
    id: string;
  };
}

export default function TodoDetailPage({ params }: Props) {
  return <TodoDetail id={params.id} />;
}
