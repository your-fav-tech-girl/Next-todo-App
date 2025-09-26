import Dexie from "dexie";

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export class TodoDB extends Dexie {
  todos!: Dexie.Table<Todo, number>;

  constructor() {
    super("TodoDB");
    this.version(1).stores({
      todos: "++id,userId,title,completed",
    });
  }
}

export const db = new TodoDB();
