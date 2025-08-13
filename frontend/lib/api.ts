import {Filters} from "@/types/Filters.type";
import {EventLog} from "@/types/EventLog.type";
import {ApiResponse} from "@/types/ApiResponse.type";

const API_BASE_URL = 'http://localhost:3030'; // Adjust this URL later

function buildQuery(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.fromDate) params.set("fromDate", filters.fromDate);
  if (filters.toDate) params.set("toDate", filters.toDate);
  if (filters.eventType) params.set("eventType", filters.eventType);
  if (filters.userId) params.set("userId", filters.userId);
  return params.toString();
}

export async function fetchEvents(
  filters: Filters,
  signal?: AbortSignal
): Promise<EventLog[]> {
  const query = buildQuery(filters);
  const url = `${API_BASE_URL}/events/log${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    signal,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} ${response.statusText} ${text}`);
  }

  const data: ApiResponse = await response.json();

  if (!data.isSuccess) {
    throw new Error(data.message || 'Request failed');
  }

  return data.result;
}
