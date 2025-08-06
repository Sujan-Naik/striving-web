"use client"
import { useState, FormEvent, ChangeEvent } from 'react'

interface FormData {
  name: string
  email: string
}

export default function Project() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/project/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      console.log(result)
      setFormData({ name: '', email: '' })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <button type="submit">Create User</button>
      </form>
    </div>
  )
}