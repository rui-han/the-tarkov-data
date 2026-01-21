export interface TaskRequirement {
  task: {
    id: string;
    name: string;
  };
}

export interface Task {
  id: string;
  name: string;
  normalizedName: string;
  trader: {
    name: string;
  };
  map: {
    name: string;
  } | null;
  experience: number;
  taskImageLink?: string;
  minPlayerLevel: number;
  taskRequirements: TaskRequirement[];
  kappaRequired: boolean;
  wikiLink: string;
}

export interface TasksData {
  tasks: Task[];
}

export interface TaskTableProps {
  data: Task[];
}
