"use client";

import * as React from "react";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHandle,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  type SnapPoint,
} from "@/registry/default/drawer/drawer";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";

const comments = [
  {
    id: 1,
    user: "Alex Chen",
    avatar: "AC",
    text: "This is absolutely stunning! The attention to detail is incredible.",
    time: "2h",
    likes: 24,
  },
  {
    id: 2,
    user: "Maria Garcia",
    avatar: "MG",
    text: "Love this so much! 😍",
    time: "1h",
    likes: 8,
  },
  {
    id: 3,
    user: "James Wilson",
    avatar: "JW",
    text: "Where can I get this? Asking for a friend 👀",
    time: "45m",
    likes: 12,
  },
  {
    id: 4,
    user: "Sophie Turner",
    avatar: "ST",
    text: "The colors are perfect together!",
    time: "30m",
    likes: 5,
  },
  {
    id: 5,
    user: "David Kim",
    avatar: "DK",
    text: "Been following your work for a while, this might be your best yet.",
    time: "15m",
    likes: 18,
  },
  {
    id: 6,
    user: "Emma Roberts",
    avatar: "ER",
    text: "Shared this with all my friends!",
    time: "10m",
    likes: 3,
  },
  {
    id: 7,
    user: "Chris Johnson",
    avatar: "CJ",
    text: "This is inspiring me to start creating again.",
    time: "5m",
    likes: 7,
  },
];

export default function DrawerComments() {
  const [snap, setSnap] = React.useState<SnapPoint>(0.4);
  const [newComment, setNewComment] = React.useState("");

  return (
    <Drawer
      snapPoints={[0.4, 1]}
      activeSnapPoint={snap}
      onActiveSnapPointChange={setSnap}
    >
      <DrawerTrigger render={<Button variant="outline" />}>
        <span className="flex items-center gap-2">
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {comments.length} Comments
        </span>
      </DrawerTrigger>
      <DrawerContent className={"max-w-2xl"}>
        <DrawerHandle />
        <DrawerHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DrawerTitle>Comments</DrawerTitle>
            <span className="text-muted-foreground text-sm">
              {comments.length} comments
            </span>
          </div>
        </DrawerHeader>
        <DrawerBody className="py-4">
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="bg-muted text-muted-foreground flex size-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  {comment.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.user}</span>
                    <span className="text-muted-foreground text-xs">
                      {comment.time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.text}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <button className="text-muted-foreground flex items-center gap-1 text-xs hover:text-red-500">
                      <svg
                        className="size-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className="tabular-nums">{comment.likes}</span>
                    </button>
                    <button className="text-muted-foreground text-xs hover:underline">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DrawerBody>

        <DrawerFooter className="sticky bottom-0 border-t">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setNewComment("");
            }}
          >
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newComment.trim()}>
              Post
            </Button>
          </form>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
