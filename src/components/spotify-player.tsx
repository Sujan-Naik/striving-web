"use client"
import { useState } from "react"
import { useSession } from "next-auth/react";

export default function SpotifyPlayer() {
  const { data: session, status } = useSession();
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePlayPause = async () => {
    if (!session?.user?.providers?.spotify?.accessToken) {
        alert("Please log in to Spotify");
        return;
      }

      const accessToken = session.user.providers.spotify.accessToken;
    setLoading(true);
    try {
      // Check current playback state
      const currentPlaybackResponse = await fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!currentPlaybackResponse.ok) {
        throw new Error("Failed to get current playback");
      }

      const playbackState = await currentPlaybackResponse.json();

      if (playbackState.is_playing) {
        // Pause playback
        await fetch("https://api.spotify.com/v1/me/player/pause", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setIsPlaying(false);
      } else {
        // Resume playback
        await fetch("https://api.spotify.com/v1/me/player/play", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error(error);
      alert("Error controlling playback");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (status !== "authenticated" || !session?.user?.spotifyAccessToken) {
      alert("Please log in to Spotify");
      return;
    }

    const accessToken = session.user.spotifyAccessToken;

    try {
      await fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error(error);
      alert("Error skipping to next track");
    }
  };

  const handlePrevious = async () => {
    if (status !== "authenticated" || !session?.user?.spotifyAccessToken) {
      alert("Please log in to Spotify");
      return;
    }

    const accessToken = session.user.spotifyAccessToken;

    try {
      await fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error(error);
      alert("Error skipping to previous track");
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <button onClick={handlePrevious} disabled={loading}>Prev</button>
      <button onClick={handlePlayPause} disabled={loading}>
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button onClick={handleNext} disabled={loading}>Next</button>
    </div>
  );
}