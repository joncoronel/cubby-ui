"use client";

import * as React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
} from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHandle,
  DrawerTrigger,
} from "@/registry/default/drawer/drawer";
import { Button } from "@/registry/default/button/button";
import { Slider } from "@/registry/default/slider/slider";

const currentTrack = {
  title: "Bohemian Rhapsody",
  artist: "Queen",
  album: "A Night at the Opera",
  duration: 354, // seconds
  currentTime: 83, // seconds
};

const queue = [
  { id: 1, title: "Don't Stop Me Now", artist: "Queen", duration: "3:29" },
  { id: 2, title: "Somebody to Love", artist: "Queen", duration: "4:56" },
  { id: 3, title: "We Will Rock You", artist: "Queen", duration: "2:01" },
  {
    id: 4,
    title: "Under Pressure",
    artist: "Queen & David Bowie",
    duration: "4:04",
  },
  { id: 5, title: "Radio Ga Ga", artist: "Queen", duration: "5:48" },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function DrawerMusicPlayer() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState([
    (currentTrack.currentTime / currentTrack.duration) * 100,
  ]);

  return (
    <Drawer snapPoints={["92px", 1]} sequentialSnap={true}>
      {({ snapProgress }) => (
        <>
          <DrawerTrigger render={<Button variant="outline" />}>
            Open Music Player
          </DrawerTrigger>
          <DrawerContent className="relative">
            <DrawerHandle />

            {/* Mini Player - absolutely positioned, fades out as drawer expands */}
            {/* Opacity uses CSS variable, pointer-events uses JS for conditional logic */}
            <div
              className="absolute inset-x-0 top-0 z-10 px-4 pt-8 pb-4"
              style={{
                opacity: "calc(1 - var(--drawer-snap-progress, 0))",
                pointerEvents: snapProgress > 0.7 ? "none" : "auto",
              }}
            >
              <div className="flex items-center gap-3">
                {/* Album Art */}
                <div className="size-12 shrink-0 rounded-md bg-gradient-to-br from-purple-600 to-pink-500" />

                {/* Track Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {currentTrack.title}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {currentTrack.artist}
                  </p>
                </div>

                {/* Play/Pause */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="size-5" />
                  ) : (
                    <Play className="size-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Full Player - fades in as drawer expands */}
            <div
              className="flex min-h-0 flex-1 flex-col gap-6 px-6 pt-6"
              style={{
                opacity: "var(--drawer-snap-progress, 0)",
                pointerEvents: snapProgress < 0.3 ? "none" : "auto",
              }}
            >
              {/* Large Album Art */}
              <div className="flex shrink-0 justify-center">
                <div className="size-48 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 shadow-2xl" />
              </div>

              {/* Track Info */}
              <div className="shrink-0 text-center">
                <h2 className="text-xl font-semibold">{currentTrack.title}</h2>
                <p className="text-muted-foreground">{currentTrack.artist}</p>
              </div>

              {/* Progress Bar */}
              <div className="flex shrink-0 flex-col gap-1">
                <Slider
                  value={progress}
                  onValueChange={(value) =>
                    setProgress(Array.isArray(value) ? value : [value])
                  }
                  max={100}
                />
                <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
                  <span>
                    {formatTime(
                      Math.floor((progress[0] / 100) * currentTrack.duration),
                    )}
                  </span>
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex shrink-0 items-center justify-center gap-4">
                <Button size="icon" variant="ghost">
                  <Shuffle className="size-5" />
                </Button>
                <Button size="icon" variant="ghost">
                  <SkipBack className="size-6" />
                </Button>
                <Button
                  size="icon"
                  className="size-14 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="size-7" />
                  ) : (
                    <Play className="ml-0.5 size-7" />
                  )}
                </Button>
                <Button size="icon" variant="ghost">
                  <SkipForward className="size-6" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Repeat className="size-5" />
                </Button>
              </div>

              {/* Queue */}
              <div className="flex min-h-0 flex-1 flex-col border-t pt-4">
                <div className="mb-3 flex shrink-0 items-center justify-between">
                  <h3 className="text-sm font-semibold">Up Next</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground h-auto px-2 py-1 text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="-mx-2 flex flex-col gap-1 overflow-y-auto px-2">
                  {queue.map((track) => (
                    <button
                      key={track.id}
                      className="hover:bg-muted flex shrink-0 items-center gap-3 rounded-lg p-2 text-left transition-colors"
                    >
                      <div className="size-10 shrink-0 rounded bg-gradient-to-br from-purple-600/50 to-pink-500/50" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {track.title}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {track.artist}
                        </p>
                      </div>
                      <span className="text-muted-foreground/60 text-xs tabular-nums">
                        {track.duration}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DrawerContent>
        </>
      )}
    </Drawer>
  );
}
