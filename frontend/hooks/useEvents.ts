
import { useState, useCallback, useRef } from 'react';
import { fetchEvents } from '@/lib/api';
import {Filters} from "@/types/Filters.type";
import {EventLog} from "@/types/EventLog.type";

export function useEvents() {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadEvents = useCallback(async (filters: Filters) => {
    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchEvents(filters, controller.signal);
      setEvents(result);
    } catch (e: any) {
      if (e?.name === 'AbortError') return; // Request was canceled
      setError(e?.message ?? 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    events,
    loading,
    error,
    loadEvents,
    cleanup
  };
}
