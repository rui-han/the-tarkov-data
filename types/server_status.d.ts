export interface ServerStatusData {
  status: {
    generalStatus: GeneralStatus;
    messages: Message[];
  };
}

interface GeneralStatus {
  name: string;
  message: string;
  status: string;
}

interface Message {
  time: string;
  type: string;
  content: string;
  solveTime: number;
}
