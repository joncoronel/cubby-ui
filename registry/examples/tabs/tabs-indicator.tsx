import { Tabs, TabsList, TabsTrigger } from "@/registry/default/tabs/tabs";

const indicators = ["solid", "raised"] as const;

export default function TabsIndicator() {
  return (
    <div className="flex flex-col items-center gap-6">
      {indicators.map((indicator) => (
        <div key={indicator} className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground text-xs font-medium capitalize">
            {indicator}
          </p>
          <Tabs defaultValue="account">
            <TabsList indicator={indicator}>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      ))}
    </div>
  );
}
