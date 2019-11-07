export interface Poll {
  id: string;
  question: string;
  ownerId: string;
  // type: 'single' | 'multi';
  options: {
    [optionId: string]: {
      label: string;
      position: number;
    };
  };
  users: {
    [userId: string]: string;
  };
  votes: {
    [userId_optionId_timestamp: string]: {
      userId: string;
      optionId: string;
      timestamp: number;
    };
  };
}
