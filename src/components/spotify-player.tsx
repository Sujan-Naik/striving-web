"use client"

import { useSpotify } from "@/hooks/use-spotify"
import { AlertCircle, Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { HeadedButton, HeadedDialog, VariantEnum } from "headed-ui"
import { useEffect, useState } from "react"

export function SpotifyPlayer() {
  const { playbackState, loading, error, togglePlayPause, nextTrack, previousTrack } = useSpotify()
  const [errorDialogOpen, setErrorDialog] = useState(false)

  useEffect(() => {
    if (error) {
      setErrorDialog(true)
    }
  }, [error])

  return (
    <>
      {error && (
        <HeadedDialog
          title="Error Loading Spotify"
          isOpen={errorDialogOpen}
          onClick={() => setErrorDialog(false)}
          variant={VariantEnum.Outline}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        </HeadedDialog>
      )}

      <div className="flex items-center gap-2">
        {loading && !playbackState && <p>Loading...</p>}

        {playbackState && (
          <>
            <HeadedButton variant={VariantEnum.Primary} onClick={previousTrack} >
              <SkipBack className="h-4 w-4" />
            </HeadedButton>

            <HeadedButton variant={VariantEnum.Primary} onClick={togglePlayPause} >
              {playbackState.is_playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </HeadedButton>

            <HeadedButton variant={VariantEnum.Primary} onClick={nextTrack} >
              <SkipForward className="h-4 w-4" />
            </HeadedButton>
          </>
        )}

        {!playbackState && !loading && !error && <p>No active playback</p>}
      </div>
    </>
  )
}
