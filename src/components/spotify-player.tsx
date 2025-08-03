"use client"

import {useSpotify} from "@/hooks/use-spotify"
import {AlertCircle, List, Music, Pause, Play, SkipBack, SkipForward} from "lucide-react"
import {
  HeadedButton,
  HeadedCard,
  HeadedDialog,
  HeadedGrid,
  HeadedTextAnim,
  TextAnimationType,
  VariantEnum
} from "headed-ui"
import {useEffect, useState} from "react"

export function SpotifyPlayer() {
  const {
    playbackState,
    loading,
    error,
    togglePlayPause,
    nextTrack,
    previousTrack,
    playlists,
    albums,
    fetchPlaylists,
    fetchAlbums,
    playPlaylist,
    playAlbum
  } = useSpotify()

  const [errorDialogOpen, setErrorDialog] = useState(false)
  const [view, setView] = useState<'player' | 'playlists' | 'albums'>('player')

  useEffect(() => {
    if (error) {
      setErrorDialog(true)
    }
  }, [error])

  useEffect(() => {
    if (view === 'playlists') fetchPlaylists()
    if (view === 'albums') fetchAlbums()
  }, [view])

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

      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex gap-2">
          <HeadedButton
            variant={view === 'player' ? VariantEnum.Primary : VariantEnum.Outline}
            onClick={() => setView('player')}
          >
            Player
          </HeadedButton>
          <HeadedButton
            variant={view === 'playlists' ? VariantEnum.Primary : VariantEnum.Outline}
            onClick={() => setView('playlists')}
          >
            <List className="h-4 w-4 mr-1" />
            Playlists
          </HeadedButton>
          <HeadedButton
            variant={view === 'albums' ? VariantEnum.Primary : VariantEnum.Outline}
            onClick={() => setView('albums')}
          >
            <Music className="h-4 w-4 mr-1" />
            Albums
          </HeadedButton>
        </div>

        {/* Player Controls */}
        {view === 'player' && (
          <div className="flex items-center gap-2" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            {loading && !playbackState && <p>Loading...</p>}


            {playbackState && (
                <>
                  {playbackState.item && (
                      <img style={{zIndex: -1, position: 'absolute', transform: 'translate(0, 0)'}} width={'100%'} height={'auto'} src={playbackState.item.album.images[0].url} className=" w-full h-auto rounded mb-2"  alt={playbackState.item.name}/>
                  )}

              <HeadedCard variant={VariantEnum.Outline} width={'30vw'} height={'auto'} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '0'}}>
                <HeadedCard variant={VariantEnum.Outline} style={{border: 0}}>
                  <HeadedButton variant={VariantEnum.Primary} onClick={previousTrack}>
                    <SkipBack className="h-4 w-4" />
                  </HeadedButton>

                  <HeadedButton variant={VariantEnum.Primary} onClick={togglePlayPause}>
                    {playbackState.is_playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </HeadedButton>

                  <HeadedButton variant={VariantEnum.Primary} onClick={nextTrack}>
                    <SkipForward className="h-4 w-4" />
                  </HeadedButton>
                </HeadedCard>

                {playbackState.item && (
                  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}} >
                    <HeadedTextAnim speed={50} delay={0} animation={TextAnimationType.COLOR_CYCLE}>{playbackState.item.name}</HeadedTextAnim>
                                          {/*{playbackState.item.artists.map(a => a.name).join(', ')}*/}

                    <HeadedTextAnim speed={50} delay={0} animation={TextAnimationType.COLOR_CYCLE}>{playbackState.item.artists[0].name}</HeadedTextAnim>
                  </div>
                )}
              </HeadedCard>
                </>
            )}
            {!playbackState && !loading && !error && <p>No active playback</p>}
          </div>

        )}

        {/* Playlists */}
        {view === 'playlists' && (

<HeadedGrid variant={VariantEnum.Primary} height={'auto'} width={'100%'} fillDirection={'rows'}>
  {playlists.map((playlist) => (
              <HeadedCard width={"auto"} height={"auto"} variant={VariantEnum.Secondary} key={playlist.id} className="border rounded p-4">
                  {playlist.images[0] && (
                    <img width={'90%'} height={'90%'} src={playlist.images[0].url} alt={playlist.name} className=" w-full h-auto rounded mb-2" />
                  )}
                  <h3 className="font-medium">{playlist.name}</h3>
                  <p className="text-sm text-gray-600">{playlist.tracks.total} tracks</p>
                  <HeadedButton
                    variant={VariantEnum.Primary}
                    onClick={() => playPlaylist(playlist.uri)}
                    className="mt-2 w-full"
                  >
                    Play
                  </HeadedButton>
              </HeadedCard>
            ))}
        </HeadedGrid>
        )}

        {/* Albums */}
        {view === 'albums' && (
<HeadedGrid variant={VariantEnum.Primary} height={'auto'} width={'100%'} fillDirection={'rows'}>
            {albums.map((album) => (
                <HeadedCard width={"auto"} height={"auto"} variant={VariantEnum.Secondary} key={album.id} className="border rounded p-4">
                {album.images[0] && (
                  <img width={'90%'} height={'90%'} src={album.images[0].url} alt={album.name} className="w-full h-32 rounded mb-2" />
                )}
                <h3 className="font-medium">{album.name}</h3>
                <p className="text-sm text-gray-600">{album.artists.map(a => a.name).join(', ')}</p>
                <HeadedButton
                  variant={VariantEnum.Primary}
                  onClick={() => playAlbum(album.uri)}
                  className="mt-2 w-full"
                >
                  Play
                </HeadedButton>
                </HeadedCard>
            ))}
</HeadedGrid>
        )}
      </div>
    </>
  )
}