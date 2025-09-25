import { Checkbox } from "@/components/ui/checkbox";

function TodoSettings({ completed, setCompleted }) {
  return (
    <div className="space-y-2">
      <Checkbox
        id="todo-complete"
        label="Mark as complete"
        checked={completed}
        onChange={(e) => setCompleted(e.target.checked)}
      />
    </div>
  );
}
