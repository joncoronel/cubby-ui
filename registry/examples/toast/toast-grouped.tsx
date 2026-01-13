"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import { toast } from "@/registry/default/toast/toast";

// Simulate deployment IDs
let deploymentCounter = 0;
function generateDeploymentId() {
  deploymentCounter++;
  return Math.random().toString(16).slice(2, 9);
}

// Team activity notifications for the non-loading example
const TEAM_NOTIFICATIONS = [
  { title: "Alex joined the workspace", type: "info" as const },
  { title: "Sarah completed a task", type: "success" as const },
  { title: "Build failed on main branch", type: "error" as const },
  { title: "Storage usage at 90%", type: "warning" as const },
  { title: "New comment on PR #42", type: "info" as const },
  { title: "Deployment to production succeeded", type: "success" as const },
];

function ToastGrouped() {
  const startDeployment = React.useCallback(() => {
    const deploymentId = generateDeploymentId();
    const branchName = deploymentCounter % 2 === 0 ? "main" : "develop";
    const controller = new AbortController();

    // Simulate deployment (5-10 seconds)
    const deployPromise = new Promise<{ id: string }>((resolve, reject) => {
      const timeoutId = setTimeout(
        () => {
          resolve({ id: deploymentId });
        },
        5000 + Math.random() * 5000,
      );

      // Handle abort
      controller.signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        reject(new Error("Cancelled"));
      });
    });

    toast.groupedPromise(
      deployPromise,
      {
        loading: {
          title: `${deploymentId} is building on app - ${branchName}`,
          action: { label: "Cancel", onClick: () => controller.abort() },
        },
        success: () => ({ title: `${deploymentId} deployed successfully` }),
        error: () => ({ title: `${deploymentId} deployment failed` }),
        aborted: () => ({
          title: `${deploymentId} deployment cancelled`,
          type: "error",
        }),
      },
      {
        groupId: "deployments",
        showCloseButton: false,
        signal: controller.signal,
        groupSummary: ({
          loadingCount,
          successCount,
          errorCount,
          completedCount,
        }) => {
          if (loadingCount > 0) return `${loadingCount} deploying`;
          if (errorCount === 0) return `All ${completedCount} succeeded`;
          if (successCount === 0) return `All ${completedCount} failed`;
          return `${successCount} of ${completedCount} succeeded`;
        },
        groupAction: { label: "Show", expandedLabel: "Hide" },
      },
    );
  }, []);

  return (
    <Button variant="outline" onClick={startDeployment}>
      Deploy App
    </Button>
  );
}

function ToastGroupedNotifications() {
  const sendNotification = React.useCallback(() => {
    const notification =
      TEAM_NOTIFICATIONS[Math.floor(Math.random() * TEAM_NOTIFICATIONS.length)];
    toast.grouped({
      groupId: "team-activity",
      title: notification.title,
      type: notification.type,
      duration: 5000,
      groupSummary: ({ totalCount }) =>
        `${totalCount} notification${totalCount !== 1 ? "s" : ""}`,
      groupAction: { label: "Show", expandedLabel: "Hide" },
    });
  }, []);

  return (
    <Button variant="outline" onClick={sendNotification}>
      Team Activity
    </Button>
  );
}

export default function ToastGroupedDemo() {
  return (
    <div className="flex gap-2">
      <ToastGrouped />
      <ToastGroupedNotifications />
    </div>
  );
}
