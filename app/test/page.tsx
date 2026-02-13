"use client";

import { useState } from "react";
import { useAnimatedHeight } from "@/registry/default/hooks/use-animated-height";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPanels,
  TabsTrigger,
} from "@/registry/default/tabs/tabs";
import { Card, CardContent } from "@/registry/default/card/card";
import { Badge } from "@/registry/default/badge/badge";

export default function TestPage() {
  const [expanded, setExpanded] = useState(false);
  const { outerRef, innerRef } = useAnimatedHeight();

  return (
    <div className="flex min-h-screen justify-center p-8">
      <div className="w-[500px] space-y-12">
        {/* Underline tabs test */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Underline tabs test</h2>
          <Tabs defaultValue="overview">
            <TabsList variant="underline">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsPanels>
              <TabsContent value="overview">
                <Card className="border-0 shadow-none">
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">
                        Dashboard Overview
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Monitor your key metrics and performance indicators
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-secondary/10 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">128</p>
                        <p className="text-muted-foreground text-xs">
                          Active Users
                        </p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">89%</p>
                        <p className="text-muted-foreground text-xs">
                          Completion
                        </p>
                      </div>
                      <div className="bg-secondary/10 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">24</p>
                        <p className="text-muted-foreground text-xs">Tasks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="analytics">
                <Card className="border-0 shadow-none">
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Analytics</h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Deep dive into your data and trends
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-secondary/10 flex items-center justify-between rounded-lg p-3">
                        <span className="text-sm font-medium">Page Views</span>
                        <Badge variant="secondary">+12.3%</Badge>
                      </div>
                      <div className="bg-secondary/10 flex items-center justify-between rounded-lg p-3">
                        <span className="text-sm font-medium">
                          Conversion Rate
                        </span>
                        <Badge variant="success">+4.2%</Badge>
                      </div>
                      <div className="bg-secondary/10 flex items-center justify-between rounded-lg p-3">
                        <span className="text-sm font-medium">
                          Avg. Session
                        </span>
                        <Badge variant="outline">3m 42s</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reports">
                <Card className="border-0 shadow-none">
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Reports</h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        Access and generate comprehensive reports
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">Weekly Summary</span>
                          <Badge>New</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Generated 2 hours ago
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">Monthly Analysis</span>
                          <Badge variant="secondary">PDF</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Last updated 3 days ago
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </TabsPanels>
          </Tabs>
        </div>

        {/* Toggle test */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Toggle test</h2>
          <button
            onClick={() => setExpanded((b) => !b)}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Toggle height
          </button>
          <div
            className={cn(
              "overflow-y-clip rounded-lg border",
              "ease-out-cubic transition-[height] duration-200",
            )}
            ref={outerRef}
          >
            <div ref={innerRef} className="p-4">
              <h2 className="text-lg font-semibold">Animated Height</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                This card animates its height when content changes.
              </p>
              {expanded && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    Extra content that increases height.
                  </p>
                  <p className="text-sm">
                    More content here to make it taller.
                  </p>
                  <p className="text-sm">
                    And even more content for good measure.
                  </p>
                  <p className="text-sm">One last line of extra content.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
