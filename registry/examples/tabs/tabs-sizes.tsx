import {
  Tabs,
  TabsContent,
  TabsList,
  TabsPanels,
  TabsTrigger,
} from "@/registry/default/tabs/tabs";

export default function TabsSizes() {
  return (
    <div className="flex w-[400px] flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs font-medium">Small</p>
        <Tabs defaultValue="account">
          <TabsList size="small">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          <TabsPanels>
            <TabsContent value="account">
              <p className="text-muted-foreground py-2 text-sm">
                Manage your account details and preferences.
              </p>
            </TabsContent>
            <TabsContent value="password">
              <p className="text-muted-foreground py-2 text-sm">
                Update your password and security settings.
              </p>
            </TabsContent>
            <TabsContent value="team">
              <p className="text-muted-foreground py-2 text-sm">
                Invite teammates and manage their roles.
              </p>
            </TabsContent>
          </TabsPanels>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs font-medium">
          Medium (default)
        </p>
        <Tabs defaultValue="account">
          <TabsList size="medium">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          <TabsPanels>
            <TabsContent value="account">
              <p className="text-muted-foreground py-2 text-sm">
                Manage your account details and preferences.
              </p>
            </TabsContent>
            <TabsContent value="password">
              <p className="text-muted-foreground py-2 text-sm">
                Update your password and security settings.
              </p>
            </TabsContent>
            <TabsContent value="team">
              <p className="text-muted-foreground py-2 text-sm">
                Invite teammates and manage their roles.
              </p>
            </TabsContent>
          </TabsPanels>
        </Tabs>
      </div>
    </div>
  );
}
