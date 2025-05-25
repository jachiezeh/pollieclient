// client/app/page.tsx
'use client' // Ensures this page runs on the client-side (browser)

import ClientLayout from './components/ClientLayout';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define the shape of a Poll object for TypeScript safety
interface Poll {
  _id: string
  title: string
  description?: string
  options: Array<{ text: string; votes: number }>
  createdAt: string
}

export default function Home() {
  // State to store the list of polls
  const [polls, setPolls] = useState<Poll[]>([])
  // State to handle loading spinner
  const [loading, setLoading] = useState(true)
  // State to handle any fetch errors
  const [error, setError] = useState('')
  // Router to navigate programmatically
  const router = useRouter()

  // Fetch the polls from the backend when component mounts
  useEffect(() => {
    const fetchPolls = async () => {
      try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/polls`;
      console.log('API BASE URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log('Fetching from:', url);
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch polls: ${response.status} ${response.statusText}\n${text}`);
      }

        const data = await response.json()
        setPolls(data) // Save fetched polls to state
      } catch (err) {
        setError('Failed to load polls. Please try again later.')
        console.error('Error fetching polls:', err)
      } finally {
        setLoading(false) // Hide loading spinner regardless of success/failure
      }
    }

    fetchPolls()
  }, []) // Empty dependency array = runs once on page load

  // {/* Page Header */}
  // {/* Show error message if fetching fails */}
  // {/* Show loading spinner while fetching polls */}
  // {/* Optional description */}
  return (
    <ClientLayout>
    <div className="container mx-auto p-6">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Live Polling App</h1>
        <button
          onClick={() => router.push('/create')} // Navigate to create poll page
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Create New Poll
        </button>
      </div>

      
      {error && (
        <div className="text-center text-red-500 mb-6 font-medium">{error}</div>
      )}

      
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-md animate-pulse"
            >
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
          </div>
          ))}
        </div>
      ) : polls.length > 0 ? (
        // Show list of polls in a responsive grid
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Link href={`/polls/${poll._id}`} key={poll._id}>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{poll.title}</h2>

                
                {poll.description ? (
                  <p className="text-gray-600 mb-4 line-clamp-2">{poll.description}</p>
                ) : (
                  <p className="text-gray-400 mb-4 italic">No description provided</p>
                )}

                <p className="text-sm text-gray-500">
                  Created on: {new Date(poll.createdAt).toLocaleDateString('en-US')}
                </p>
                <p className="text-sm font-medium text-blue-500 mt-2">
                  {poll.options.length} options • Click to vote
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // No polls available message
        <div className="text-center py-10">
          <h2 className="text-xl font-medium text-gray-600">No polls available</h2>
          <p className="text-gray-500 mt-2">Create a new poll to get started!</p>
        </div>
      )}
    </div>
    </ClientLayout>
  )
}
