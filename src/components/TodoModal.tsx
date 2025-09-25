"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Save, X } from "lucide-react";

type TodoModalProps = {
  onClose: any;
  onAdd: any;
  onEdit: any;
  todo: any;
};

export default function TodoModalProps({
  onClose,
  onAdd,
  onEdit,
  todo,
}: TodoModalProps) {
  const [title, setTitle] = useState(todo?.title || "");

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    if (todo) {
      onEdit({ ...todo, title: trimmed });
    } else {
      const newTodo = {
        id: Date.now(),
        title: trimmed,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      onAdd(newTodo);
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        className="bg-white rounded p-6 w-80 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-semibold text-lg">
          {todo ? "Edit Todo" : "New Todo"}
        </h2>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Todo title…"
          autoFocus
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {todo ? (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
