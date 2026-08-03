"use client";

import { useState } from "react";

import {
  BaseDrawer,
  BaseDrawerTrigger,
  BaseDrawerPopup,
  BaseDrawerHeader,
  BaseDrawerTitle,
  BaseDrawerDescription,
  BaseDrawerPanel,
  BaseDrawerMenu,
  BaseDrawerMenuGroup,
  BaseDrawerMenuGroupLabel,
  BaseDrawerMenuCheckboxItem,
  BaseDrawerMenuRadioGroup,
  BaseDrawerMenuRadioItem,
  BaseDrawerMenuSeparator,
} from "@/registry/default/base-drawer/base-drawer";
import { Button } from "@/registry/default/button/button";

export default function BaseDrawerWithMenu() {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [airplane, setAirplane] = useState(false);
  const [quality, setQuality] = useState("high");

  return (
    <BaseDrawer>
      <BaseDrawerTrigger render={<Button variant="outline" />}>
        Settings
      </BaseDrawerTrigger>
      <BaseDrawerPopup showBar>
        <BaseDrawerHeader>
          <BaseDrawerTitle>Settings</BaseDrawerTitle>
          <BaseDrawerDescription>
            Toggles use a switch, single-choice options use a checkmark.
          </BaseDrawerDescription>
        </BaseDrawerHeader>
        <BaseDrawerPanel>
          <BaseDrawerMenu>
            <BaseDrawerMenuGroup>
              <BaseDrawerMenuGroupLabel>Connections</BaseDrawerMenuGroupLabel>
              <BaseDrawerMenuCheckboxItem
                indicator="switch"
                checked={wifi}
                onCheckedChange={setWifi}
              >
                Wi-Fi
              </BaseDrawerMenuCheckboxItem>
              <BaseDrawerMenuCheckboxItem
                indicator="switch"
                checked={bluetooth}
                onCheckedChange={setBluetooth}
              >
                Bluetooth
              </BaseDrawerMenuCheckboxItem>
              <BaseDrawerMenuCheckboxItem
                checked={airplane}
                onCheckedChange={setAirplane}
              >
                Airplane mode
              </BaseDrawerMenuCheckboxItem>
            </BaseDrawerMenuGroup>
            <BaseDrawerMenuSeparator />
            <BaseDrawerMenuGroup>
              <BaseDrawerMenuGroupLabel>
                Streaming quality
              </BaseDrawerMenuGroupLabel>
              <BaseDrawerMenuRadioGroup
                value={quality}
                onValueChange={(next) => setQuality(next as string)}
              >
                <BaseDrawerMenuRadioItem value="low">
                  Low
                </BaseDrawerMenuRadioItem>
                <BaseDrawerMenuRadioItem value="standard">
                  Standard
                </BaseDrawerMenuRadioItem>
                <BaseDrawerMenuRadioItem value="high">
                  High
                </BaseDrawerMenuRadioItem>
              </BaseDrawerMenuRadioGroup>
            </BaseDrawerMenuGroup>
          </BaseDrawerMenu>
        </BaseDrawerPanel>
      </BaseDrawerPopup>
    </BaseDrawer>
  );
}
