"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditConcertPage() {
  const params = useParams();
  const id = params?.id;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: API Call
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Concert #{id}</h1>
        <Link
          href="/admin/concerts"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           {/* Mocked existing data */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Concert Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue="Spring Recital 2025"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>

             <div className="space-y-1">
              <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">
                Date & Time
              </label>
              <input
                type="datetime-local"
                id="datetime"
                name="datetime"
                defaultValue="2025-04-15T19:00"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>
          </div>

          <div className="space-y-1">
             <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                Venue Name
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                defaultValue="Suntory Hall"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
          </div>

           <div className="space-y-1">
             <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                Program / Description
              </label>
              <textarea
                id="program"
                name="program"
                rows={5}
                defaultValue="Beethoven: Sonata No. 30..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
             <div className="space-y-1">
              <label htmlFor="ticket_url" className="block text-sm font-medium text-gray-700">
                Ticket URL
              </label>
              <input
                type="url"
                id="ticket_url"
                name="ticket_url"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>
             <div className="space-y-1">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
               <select
                id="status"
                name="status"
                defaultValue="upcoming"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              >
                <option value="planning">Planning</option>
                <option value="upcoming">Upcoming</option>
                <option value="finished">Finished</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
             <button
              type="button"
              className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Delete Concert
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Update Concert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
