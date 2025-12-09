"use client"

import { useState } from "react"
import { Label } from "@/registry/default/label/label"
import { Textarea } from "@/registry/default/textarea/textarea"

export default function TextareaControlled() {
  const [bio, setBio] = useState("")

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="bio">Bio</Label>
      <Textarea
        placeholder="Tell us a little bit about yourself"
        id="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <p className="text-sm text-muted-foreground">
        {bio.length}/500 characters
      </p>
    </div>
  )
}