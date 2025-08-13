"use client";
import React, { useEffect, useState } from "react";
import FilterForm from "@/components/filterForm";
import { useEvents } from "@/hooks/useEvents";
import {Filters} from "@/types/Filters.type";

const initialFilters: Filters = {
  fromDate: "",
  toDate: "",
  eventType: "",
  userId: ""
};

export default function EventsPage() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const { events, loading, error, loadEvents, cleanup } = useEvents();

  // Load events when filters change or on initial render
  useEffect(() => {
    loadEvents(filters);
    return cleanup; // Unmount -> cleanup
  }, [loadEvents, cleanup, filters]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents(filters);
  };

  const onReset = () => {
    const resetFilters = { ...initialFilters };
    setFilters(resetFilters);
    loadEvents(resetFilters);
  };

  return (
    <main className="mx-auto max-w-4xl p-6 dark:text-gray-200">
      <h1 className="text-2xl font-semibold mb-4">Event Logs</h1>

      <FilterForm
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        onSubmit={onSubmit}
        onReset={onReset}
      />

      {error ? (
        <div className="text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-3 mb-4">
          {error}
        </div>
      ) : null}

      {!loading && !error && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {events.length} event{events.length === 1 ? "" : "s"} found
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="text-left p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200">Timestamp</th>
            <th className="text-left p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200">User ID</th>
            <th className="text-left p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200">Event Type</th>
            <th className="text-left p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200">Original Line</th>
          </tr>
          </thead>
          <tbody>
          {events.map((e, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
              <td className="p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200">{e.timestamp}</td>
              <td className="p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200">{e.userId}</td>
              <td className="p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200">{e.eventType}</td>
              <td className="p-2 border-b border-gray-200 dark:border-gray-600 dark:text-gray-200 font-mono text-xs">{e.originalLine}</td>
            </tr>
          ))}
          {!loading && events.length === 0 && !error && (
            <tr>
              <td className="p-3 text-center text-gray-500 dark:text-gray-400" colSpan={4}>
                No events to display
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
