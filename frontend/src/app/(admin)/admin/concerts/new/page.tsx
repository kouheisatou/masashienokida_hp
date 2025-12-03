"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewConcertPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const dateValue = formData.get("datetime") as string;
    
    const payload = {
        title: formData.get("title"),
        // Ensure date is in ISO format for backend
        date: dateValue ? new Date(dateValue).toISOString() : new Date().toISOString(),
        venue: formData.get("venue"),
        program: formData.get("program"),
        ticketUrl: formData.get("ticket_url"),
        // Note: 'status' field handling depends on backend DTO. 
        // Currently backend DTO doesn't have status, but assumes 'isArchived' or similar.
        // We will ignore status for now or map it if backend supports it.
    };

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011';
        const res = await fetch(`${apiUrl}/concerts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            router.push('/admin/concerts');
            router.refresh(); // Refresh to show new data
        } else {
            const errorData = await res.json();
            alert(`Error: ${errorData.message || 'Failed to create concert'}`);
        }
    } catch (error) {
        console.error('Failed to submit:', error);
        alert('An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Concert</h1>
        <Link
          href="/admin/concerts"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Concert Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                placeholder="e.g. Spring Recital 2025"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                placeholder="e.g. Suntory Hall"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                placeholder="List the pieces to be performed..."
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
                placeholder="https://..."
              />
            </div>
             <div className="space-y-1">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
               <select
                id="status"
                name="status"
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
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Concert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
