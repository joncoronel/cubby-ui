#!/usr/bin/env bun
import fs from "fs/promises"
import path from "path"
import registry from "../registry.json"

const OUTPUT_PATH = path.join(process.cwd(), "app/r/[component]/component-sources.ts")

async function generateComponentSources() {
  console.log("Generating component sources...")
  
  const componentSources: Record<string, string> = {}
  
  // Read all component files
  for (const item of registry.items) {
    for (const file of item.files) {
      try {
        const filePath = path.join(process.cwd(), file.path)
        const content = await fs.readFile(filePath, "utf-8")
        componentSources[file.path] = content
      } catch (error) {
        console.error(`Failed to read ${file.path}:`, error)
      }
    }
  }
  
  // Generate TypeScript file with all sources
  const output = `// This file is auto-generated. Do not edit.
// Generated component sources for production deployment

export const componentSources: Record<string, string> = ${JSON.stringify(componentSources, null, 2)}
`
  
  await fs.writeFile(OUTPUT_PATH, output)
  console.log(`Generated component sources with ${Object.keys(componentSources).length} files`)
}

generateComponentSources().catch(console.error)