export interface BubbleModel {
  type: "WARNING" | "ERROR" | "INFORMATION" | "SUCCESS";
  title: string;
  message?: string;
  when?: Date;
}

export interface DefaultReturn {
  type: any;
  payload?: any;
}
