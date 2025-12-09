"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";
import { Button } from "@/registry/default/button/button";
import { toast } from "@/registry/default/toast/toast";

export default function CheckboxGroupFormExample() {
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSkills.length === 0) {
      toast.error({
        title: "No skills selected",
        description: "Please select at least one skill before submitting.",
      });
      return;
    }

    toast.success({
      title: "Skills submitted successfully!",
      description: `You selected: ${selectedSkills.join(", ")}`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold">Select your skills</Label>
        <p className="text-sm text-muted-foreground">
          Choose all the programming skills that apply to you.
        </p>
        <CheckboxGroup value={selectedSkills} onValueChange={setSelectedSkills}>
          <div className="flex items-center space-x-2">
            <Checkbox id="javascript" value="javascript" />
            <Label htmlFor="javascript">JavaScript</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="typescript" value="typescript" />
            <Label htmlFor="typescript">TypeScript</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="react" value="react" />
            <Label htmlFor="react">React</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="nodejs" value="nodejs" />
            <Label htmlFor="nodejs">Node.js</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="python" value="python" />
            <Label htmlFor="python">Python</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="rust" value="rust" />
            <Label htmlFor="rust">Rust</Label>
          </div>
        </CheckboxGroup>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit">Submit Skills</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setSelectedSkills([])}
        >
          Clear Selection
        </Button>
      </div>
    </form>
  );
}