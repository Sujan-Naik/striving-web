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

export interface Album {
  id: string
  name: string
  artists: Array<{ name: string }>
  images: Array<{ url: string }>
  uri: string
}

export interface Playlist {
  id: string
  name: string
  images: Array<{ url: string }>
  uri: string
  tracks: { total: number }
}

export function useSpotify() {
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

   const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])

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


  const fetchPlaylists = async () => {
    try {
      const result = await spotifyApi.getPlaylists({ limit: 50 })
      if (result.success) {
        setPlaylists(result.data.items)
      }
    } catch (err) {
      console.error("Error fetching playlists:", err)
    }
  }

  const fetchAlbums = async () => {
    try {
      const result = await spotifyApi.getSavedAlbums({ limit: 50 })
      if (result.success) {
        setAlbums(result.data.items.map((item: any) => item.album))
      }
    } catch (err) {
      console.error("Error fetching albums:", err)
    }
  }

  const playPlaylist = async (uri: string) => {
    setLoading(true)
    try {
      const result = await spotifyApi.playContext(uri)
      if (result.success) {
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

  const playAlbum = async (uri: string) => {
    setLoading(true)
    try {
      const result = await spotifyApi.playContext(uri)
      if (result.success) {
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

  return {
    playbackState,
    loading,
    error,
    togglePlayPause,
    nextTrack,
    previousTrack,
    refetch: fetchPlaybackState,
     playlists,
    albums,
    fetchPlaylists,
    fetchAlbums,
    playPlaylist,
    playAlbum,
  }
}
