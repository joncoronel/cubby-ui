"use client"

import * as React from "react"
import { Toolbar } from "@base-ui/react/toolbar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { useDataTable } from "@/registry/default/data-table/data-table-context"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/registry/default/input-group/input-group"

interface DataTableSearchProps
	extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
	placeholder?: string
}

function DataTableSearch({
	placeholder = "Search and filter",
	className,
	...props
}: DataTableSearchProps) {
	const { table } = useDataTable()

	return (
		<InputGroup className="flex-1 border-0 bg-transparent shadow-none outline-none! dark:bg-transparent">
			<InputGroupAddon>
				<HugeiconsIcon
					icon={Search01Icon}
					className="text-muted-foreground size-4"
					strokeWidth={2}
				/>
			</InputGroupAddon>
			<InputGroupInput
				placeholder={placeholder}
				value={table.getState().globalFilter ?? ""}
				onChange={(e) => table.setGlobalFilter(e.target.value)}
				className={cn("h-auto py-0", className)}
				render={<Toolbar.Input />}
				{...props}
			/>
		</InputGroup>
	)
}

export { DataTableSearch }
