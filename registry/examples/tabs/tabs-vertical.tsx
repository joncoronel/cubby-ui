import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPanels,
  TabsTrigger,
} from "@/registry/default/tabs/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/default/card/card";
import { Badge } from "@/registry/default/badge/badge";
import { Button } from "@/registry/default/button/button";

export default function TabsVertical() {
  return (
    <Tabs
      defaultValue="overview"
      orientation="vertical"
      className="flex w-full gap-4"
    >
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsPanels className="min-w-0">
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Your workspace at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Projects</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Team Members</p>
                  <p className="text-3xl font-bold">48</p>
                </div>
              </div>
              <Button className="w-full" variant="secondary">
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Traffic</span>
                  <Badge variant="success">+23%</Badge>
                </div>
                <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                  <div className="bg-primary h-full w-3/4 rounded-full" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Engagement</span>
                  <Badge>67%</Badge>
                </div>
                <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                  <div className="bg-primary h-full w-2/3 rounded-full" />
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
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Q4 2024 Report</span>
                  <Badge variant="outline">PDF</Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  Updated yesterday
                </p>
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Annual Summary</span>
                  <Badge variant="outline">Excel</Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  Updated last week
                </p>
              </div>
              <Button className="w-full">Generate New Report</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage your notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary/20 flex items-center justify-between rounded-lg p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-muted-foreground text-xs">
                    Receive updates via email
                  </p>
                </div>
                <Badge variant="success">On</Badge>
              </div>
              <div className="bg-secondary/20 flex items-center justify-between rounded-lg p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-muted-foreground text-xs">
                    Browser notifications
                  </p>
                </div>
                <Badge variant="secondary">Off</Badge>
              </div>
              <div className="bg-secondary/20 flex items-center justify-between rounded-lg p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Weekly Digest</p>
                  <p className="text-muted-foreground text-xs">
                    Summary every Monday
                  </p>
                </div>
                <Badge variant="success">On</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </TabsPanels>
    </Tabs>
  );
}
