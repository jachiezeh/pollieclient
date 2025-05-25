// Client/app/polls/[id]/PollClient.tsx
'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import io, { Socket } from 'socket.io-client'

interface Option {
  _id: string
  text: string
  votes: number
}

interface Poll {
  _id: string
  title: string
  description?: string
  options: Option[]
  createdAt: string
  isActive: boolean
}

export default function PollClient() {
  const params = useParams()
  const pollId = params.id as string

  const [poll, setPoll] = useState<Poll | null>(null)
  const [selectedOption, setSelectedOption] = useState('')
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Use useRef to store the socket instance
  const socketRef = useRef<Socket | null>(null)

  const fetchPoll = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/polls/${pollId}`)
      if (!res.ok) throw new Error('Poll not found')

      const data = await res.json()
      setPoll(data)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load poll')
      setLoading(false)
    }
  }, [pollId])

  useEffect(() => {
    fetchPoll()

    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]')
    if (votedPolls.includes(pollId)) setHasVoted(true)
  }, [fetchPoll, pollId])

  // Setup socket once on mount
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.emit('join-poll', pollId)

    socket.on('poll-updated', (updatedPoll: Poll) => {
      setPoll(updatedPoll)
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [pollId])

  const handleVote = () => {
    if (!selectedOption || !pollId || hasVoted) return

    setHasVoted(true)

    // Use the same socket instance to emit vote
    if (socketRef.current) {
      socketRef.current.emit('submit-vote', { pollId, optionId: selectedOption })
    }

    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]')
    localStorage.setItem('votedPolls', JSON.stringify([...votedPolls, pollId]))
  }

  const totalVotes = useMemo(
    () => poll?.options.reduce((sum, o) => sum + o.votes, 0) || 0,
    [poll]
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">{error || 'Poll not found'}</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{poll.title}</h1>
      {poll.description && <p className="text-gray-600 mb-6">{poll.description}</p>}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-500">
            Created: {new Date(poll.createdAt).toLocaleDateString()}
          </span>
          {!poll.isActive && (
            <span className="ml-4 text-sm font-medium text-red-500">
              This poll is closed
            </span>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Options</h2>
          {poll.options.length === 0 ? (
            <p className="text-gray-500">No options available.</p>
          ) : (
            poll.options.map((option) => (
              <div key={option._id} className="mb-4">
                <div className="flex items-center mb-2">
                  {!hasVoted && poll.isActive ? (
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="poll-option"
                        className="mr-3 h-4 w-4 text-blue-500"
                        value={option._id}
                        checked={selectedOption === option._id}
                        onChange={() => setSelectedOption(option._id)}
                      />
                      <span className="text-gray-800">{option.text || 'Untitled option'}</span>
                    </label>
                  ) : (
                    <span className="text-gray-800">{option.text || 'Untitled option'}</span>
                  )}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: totalVotes > 0
                        ? `${(option.votes / totalVotes) * 100}%`
                        : '0%',
                    }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm mt-1">
                  <span>{option.votes} votes</span>
                  <span>
                    {totalVotes > 0
                      ? `${Math.round((option.votes / totalVotes) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-gray-600 text-sm">Total votes: {totalVotes}</div>

        {!hasVoted && poll.isActive && (
          <button
            onClick={handleVote}
            disabled={!selectedOption}
            className={`w-full mt-6 py-2 px-4 rounded font-medium text-white 
              ${selectedOption ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Submit Vote
          </button>
        )}

        {hasVoted && (
          <div className="mt-6 text-green-600 text-center font-medium">
            Your vote has been recorded!
          </div>
        )}
      </div>
    </div>
  )
}
