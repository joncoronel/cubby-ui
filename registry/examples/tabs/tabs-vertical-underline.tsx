import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/default/tabs/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/default/card/card";
import { Badge } from "@/registry/default/badge/badge";
import { Button } from "@/registry/default/button/button";

export default function TabsVerticalUnderline() {
  return (
    <Tabs
      defaultValue="overview"
      orientation="vertical"
      className="flex w-full gap-6"
    >
      <TabsList variant="underline">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <div className="flex-1 min-w-0">
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Your workspace at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-secondary/10 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-bold">$12.5K</p>
                  <p className="text-muted-foreground text-xs">Revenue</p>
                </div>
                <div className="bg-secondary/10 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-bold">342</p>
                  <p className="text-muted-foreground text-xs">Orders</p>
                </div>
                <div className="bg-secondary/10 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-lg sm:text-2xl font-bold">98.3%</p>
                  <p className="text-muted-foreground text-xs">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Visitor Trends</span>
                  <Badge variant="success">+15%</Badge>
                </div>
                <div className="bg-secondary h-2 overflow-hidden rounded-full">
                  <div className="from-primary to-primary/60 h-full w-4/5 rounded-full bg-gradient-to-r" />
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <Badge>3.24%</Badge>
                </div>
                <div className="bg-secondary h-2 overflow-hidden rounded-full">
                  <div className="from-primary to-primary/60 h-full w-1/3 rounded-full bg-gradient-to-r" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Download and manage reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="hover:bg-secondary/10 cursor-pointer rounded-lg border p-4 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Financial Summary</p>
                    <p className="text-muted-foreground text-xs">
                      Last generated: 2 hours ago
                    </p>
                  </div>
                  <Badge variant="outline">CSV</Badge>
                </div>
              </div>
              <div className="hover:bg-secondary/10 cursor-pointer rounded-lg border p-4 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">User Analytics</p>
                    <p className="text-muted-foreground text-xs">
                      Last generated: 1 day ago
                    </p>
                  </div>
                  <Badge variant="outline">PDF</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Create Custom Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-secondary/10 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">System Updates</p>
                    <p className="text-muted-foreground text-xs">
                      Critical updates and patches
                    </p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
              <div className="bg-secondary/10 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Marketing Emails</p>
                    <p className="text-muted-foreground text-xs">
                      Product updates and news
                    </p>
                  </div>
                  <Badge variant="secondary">Paused</Badge>
                </div>
              </div>
              <div className="bg-secondary/10 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Security Alerts</p>
                    <p className="text-muted-foreground text-xs">
                      Account security notifications
                    </p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
