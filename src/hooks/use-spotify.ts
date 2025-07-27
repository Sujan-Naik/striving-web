"use client"

import { useState, useEffect } from "react"
import { spotifyApi } from "@/lib/provider-api-client"

export interface PlaybackState {
  is_playing: boolean
  item?: {
    name: string
    artists: Array<{ name: string }>
    album: {
      name: string
      images: Array<{ url: string }>
    }
  }
}

export function useSpotify() {
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaybackState = async () => {
    try {
      const result = await spotifyApi.getCurrentPlayback()
      if (result.success) {
        setPlaybackState(result.data)
        setError(null) // Clear any previous errors
      } else {
        console.log("error fetching state:", result.error)
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    }
  }

  const togglePlayPause = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get current state first
      const currentState = await spotifyApi.getCurrentPlayback()
      if (!currentState.success) {
        setError(currentState.error)
        return
      }

      // Toggle based on current state
      const result = currentState.data?.is_playing ? await spotifyApi.pause() : await spotifyApi.play()

      if (result.success) {
        // Update local state
        setPlaybackState((prev) => (prev ? { ...prev, is_playing: !prev.is_playing } : null))
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const nextTrack = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await spotifyApi.next()
      if (result.success) {
        // Refresh playback state after a short delay
        setTimeout(fetchPlaybackState, 500)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const previousTrack = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await spotifyApi.previous()
      if (result.success) {
        // Refresh playback state after a short delay
        setTimeout(fetchPlaybackState, 500)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaybackState()
  }, [])

  return {
    playbackState,
    loading,
    error,
    togglePlayPause,
    nextTrack,
    previousTrack,
    refetch: fetchPlaybackState,
  }
}
