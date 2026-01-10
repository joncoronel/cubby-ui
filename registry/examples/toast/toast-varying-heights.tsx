"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import { toast } from "@/registry/default/toast/toast";

const messages = [
  {
    title: "Quick update",
    description: "Task completed.",
  },
  {
    title: "New comment on your post",
    description:
      "John Doe replied: 'This looks great! I especially like the attention to detail in the design. Can we schedule a call to discuss further?'",
  },
  {
    title: "Meeting reminder",
    description:
      "Your meeting with the design team starts in 15 minutes. Make sure to prepare the prototype demos and gather feedback from last week's user testing session.",
  },
  {
    title: "System notification",
    description: "Updates installed successfully.",
  },
];

export default function ToastVaryingHeights() {
  const [index, setIndex] = React.useState(0);

  const handleClick = () => {
    const message = messages[index % messages.length];
    toast({
      title: message.title,
      description: message.description,
    });
    setIndex((prev) => prev + 1);
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      Create Toast
    </Button>
  );
}
