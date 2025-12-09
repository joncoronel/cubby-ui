"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/default/tabs/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/default/card/card"
import { Badge } from "@/registry/default/badge/badge"
import { useState } from "react"

export default function TabsControlled() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Dashboard Overview</CardTitle>
              <Badge variant="secondary">Live</Badge>
            </div>
            <CardDescription>Active tab: {activeTab}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$45,231.89</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Subscriptions</p>
                <p className="text-2xl font-bold">+2350</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analytics Dashboard</CardTitle>
              <Badge>Realtime</Badge>
            </div>
            <CardDescription>Active tab: {activeTab}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">2.1M</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-bold">21.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reports Center</CardTitle>
              <Badge variant="outline">3 New</Badge>
            </div>
            <CardDescription>Active tab: {activeTab}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Monthly Report</span>
              <Badge variant="success">Ready</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm font-medium">Quarterly Analysis</span>
              <Badge variant="secondary">Processing</Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}