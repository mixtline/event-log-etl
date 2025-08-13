import express from 'express';
import * as path from 'path';
import {EventLog} from "./types/EventLog.type";
import {isFileExists, processFile} from "./utils/file";
import {ApiResponse} from "./types/ApiResponse.type";

const router = express.Router();

router.get('/log', async (req, res) => {
  try {
    const logFilePath = path.join(__dirname, '../data/events.log');

    if (!(await isFileExists(logFilePath))) {
      const response: ApiResponse = {
        result: null,
        isSuccess: false,
        message: 'Log file not found',
        errorType: 'FileNotFound'
      };
      return res.status(404).json(response);
    }

    // Extract query parameters
    let { fromDate, toDate, eventType, userId } = req.query;

    // Parse the log file
    const result: EventLog[] = [];
    await processFile(logFilePath, async (line, lineNumber) => {
      const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}) - User (\d+) Event: (.*?)$/);
      if (!match) return;

      const timestamp = match[1];
      const userNum = Number(match[2]);
      const event = match[3];

      // check if fromDate and endDate are valid date strings
      if (fromDate && isNaN(Date.parse(fromDate as string))) {
        fromDate = undefined;
      }
      if (toDate && isNaN(Date.parse(toDate as string))) {
        toDate = undefined;
      }
      // check if userId is a valid number
      if (userId && isNaN(Number(userId))) {
        userId = undefined;
      }
      // Filter by query parameters
      if (fromDate && new Date(timestamp) < new Date(fromDate as string)) return;
      if (toDate && new Date(timestamp) > new Date(toDate as string)) return;
      if (eventType && event !== eventType) return;
      if (userId && Number(userId) !== userNum) return;

      // Add to result
      result.push({
        timestamp,
        userId: userNum,
        eventType: event,
        originalLine: line.trim()
      });
    });

    // Sort the result by timestamp
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const response: ApiResponse = {
      result,
      isSuccess: true,
      message: 'Success',
      errorType: ''
    };

    return res.status(200).json(response);
  } catch (err: any) {
    const response: ApiResponse = {
      result: null,
      isSuccess: false,
      message: err?.message ?? 'Unexpected error',
      errorType: 'InternalError'
    };
    return res.status(500).json(response);
  }
});

export default router;
