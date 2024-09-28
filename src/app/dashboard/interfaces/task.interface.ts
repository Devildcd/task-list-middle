export interface TaskItem {
  type: 'email' | 'contact' | 'text' | 'tag' | 'link';
  value: string;
}

export interface Task {
  id?: string;
  items: TaskItem[];
}
