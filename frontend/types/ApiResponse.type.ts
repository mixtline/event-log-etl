import {EventLog} from "@/types/EventLog.type";

export type ApiResponse =
  | { isSuccess: true; result: EventLog[]; message: string; errorType: ""; }
  | { isSuccess: false; result: null; message: string; errorType: string; };
