"use client";

import { Switch } from "@/registry/default/switch/switch";
import { Label } from "@/registry/default/label/label";
import { useState } from "react";

export default function SwitchSettingsForm() {
  const [settings, setSettings] = useState({
    marketing: false,
    security: true,
    analytics: false,
  });

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Email Notifications</h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing">Marketing emails</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about new products and features.
            </p>
          </div>
          <Switch
            id="marketing"
            checked={settings.marketing}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, marketing: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="security">Security alerts</Label>
            <p className="text-sm text-muted-foreground">
              Receive alerts about your account security.
            </p>
          </div>
          <Switch
            id="security"
            checked={settings.security}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, security: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="analytics">Analytics reports</Label>
            <p className="text-sm text-muted-foreground">
              Receive monthly analytics reports.
            </p>
          </div>
          <Switch
            id="analytics"
            checked={settings.analytics}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, analytics: checked })
            }
          />
        </div>
      </div>
    </div>
  );
}