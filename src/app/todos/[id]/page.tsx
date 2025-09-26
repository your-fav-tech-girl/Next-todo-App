import TodoDetail from "@/components/TodoDetail";
import PageProps from "next/app";

interface TodoPageProps extends PageProps {
  params: {
    id: string;
  };
}

export default function TodoDetailPage({ params }: TodoPageProps) {
  return <TodoDetail id={params.id} />;
}
