"use client"

import * as React from "react"
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/registry/default/avatar/avatar"
import { Label } from "@/registry/default/label/label"
import { Skeleton } from "@/registry/default/skeleton/skeleton"
import { Switch } from "@/registry/default/switch/switch"

export default function SkeletonWrap() {
	const [loading, setLoading] = React.useState(true)

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Skeleton visible={loading} className="rounded-full">
					<Avatar>
						<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
				</Skeleton>
				<div className="space-y-1">
					<Skeleton visible={loading}>
						<p className="text-sm font-medium">shadcn</p>
					</Skeleton>
					<Skeleton visible={loading}>
						<p className="text-muted-foreground text-sm">@shadcn</p>
					</Skeleton>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Switch
					id="loading"
					checked={loading}
					onCheckedChange={setLoading}
				/>
				<Label htmlFor="loading">Loading</Label>
			</div>
		</div>
	)
}
