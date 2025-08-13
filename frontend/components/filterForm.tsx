import React, {useState} from "react";
import { Filters } from "@/types/Filters.type";

interface FilterProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function FilterForm({
                                 filters,
                                 setFilters,
                                 loading,
                                 onSubmit,
                                 onReset
                               }: FilterProps) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const getFormData = (form: HTMLFormElement): Filters => {
    const formData = new FormData(form);
    return Object.fromEntries(formData.entries()) as Filters;
  }

  const userIdKeyUpHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const data = getFormData(e.currentTarget.form as HTMLFormElement);
      validate(data);
  }

  const validate = (data: Filters) => {
    const newErrors: Record<string, string> = {};

    if (data.fromDate && data.toDate && new Date(data.fromDate) > new Date(data.toDate)) {
      newErrors.dateRange = "From date cannot be after To date";
    }

    if (data.eventType && !/^[a-zA-Z0-9_]+$/.test(data.eventType)) {
      newErrors.eventType = "Event type can only contain alphanumeric characters and underscores";
    }

    if (data.userId && (isNaN(Number(data.userId)) || Number(data.userId) < 0)) {
      newErrors.userId = "User ID must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = getFormData(e.currentTarget as HTMLFormElement);

    if (validate(data)) {
      setFilters(data);
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">From date</label>
        <input
          type="date"
          name="fromDate"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
        />
        {errors.dateRange && <p className="text-red-600 text-sm mt-1">{errors.dateRange}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">To date</label>
        <input
          type="date"
          name="toDate"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
        />
        {errors.dateRange && <p className="text-red-600 text-sm mt-1">{errors.dateRange}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Event type</label>
        <input
          type="text"
          name="eventType"
          placeholder="e.g. login, logout"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
        />
        {errors.eventType && <p className="text-red-600 text-sm mt-1">{errors.eventType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">User ID</label>
        <input
          type="text"
          name="userId"
          className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-200"
          onKeyUp={userIdKeyUpHandler}
        />
        {errors.userId && <p className="text-red-600 text-sm mt-1">{errors.userId}</p>}
      </div>

      <div className="md:col-span-4 flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
        <button
          type="button"
          className="border border-gray-300 dark:border-gray-600 rounded px-4 py-2 dark:text-gray-200"
          onClick={onReset}
          disabled={loading}
        >
          Reset
        </button>
      </div>
    </form>
  );
}
