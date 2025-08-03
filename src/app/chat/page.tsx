'use client'
import { useState, useEffect } from 'react'
import {useSession} from "next-auth/react";

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: Date
  senderName: string
}

interface Conversation {
  id: string
  otherUser: User
  lastMessage?: Message
}

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  if (!useSession().data?.user){
    console.log("Error Fetching Logged in user!");
  } else {
    console.log("Logged in!")
  }

  const currentUserId = useSession().data?.user?.id;


  const searchUsers = async () => {
    const res = await fetch(`/api/users/search?q=${searchQuery}`)
    const users = await res.json()
    setSearchResults(users)
  }

  const addFriend = async (userId: string) => {
        console.log(userId);
    await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currentUserId })
    })
  }

  const startConversation = async (userId: string) => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currentUserId })
    })

    if (!res.ok) throw new Error('Failed to create conversation')
      console.log(res);
    const conv = await res.json()
    setActiveConversation(conv.id)
    loadConversations()
  }

  const loadConversations = async () => {
    const res = await fetch(`/api/conversations?userId=${currentUserId}`)
    const convs = await res.json()
    setConversations(convs)
  }

  const loadMessages = async (conversationId: string) => {
    const res = await fetch(`/api/messages?conversationId=${conversationId}`)
    const msgs = await res.json()
    setMessages(msgs.map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) })))
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: activeConversation,
        senderId: currentUserId,
        content: newMessage
      })
    })

    setNewMessage('')
    loadMessages(activeConversation)
  }

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation)
    }
  }, [activeConversation])

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button onClick={searchUsers} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="p-4 border-b">
            <h3 className="font-bold mb-2">Search Results</h3>
            {searchResults.map(user => (
              <div key={user.id} className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div>
                  <button
                    onClick={() => addFriend(user.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm mr-1"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => startConversation(user.id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv,index) => (
            <div
              key={conv.id + index}
              onClick={() => setActiveConversation(conv.id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                activeConversation === conv.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium">{conv.otherUser.name}</div>
              {conv.lastMessage && (
                <div className="text-sm text-gray-500 truncate">
                  {conv.lastMessage.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.senderId === currentUserId ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded max-w-xs ${
                      message.senderId === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.senderName} • {message.createdAt.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-l"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-r"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  )
}