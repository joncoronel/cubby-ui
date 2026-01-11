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

// Store timeout IDs for cleanup
const deploymentTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

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
  const [activeDeployments, setActiveDeployments] = React.useState<
    Map<string, { toastId: string; name: string }>
  >(new Map());

  // Use ref to always access latest activeDeployments in callbacks
  const activeDeploymentsRef = React.useRef(activeDeployments);
  React.useEffect(() => {
    activeDeploymentsRef.current = activeDeployments;
  }, [activeDeployments]);

  const completeDeployment = React.useCallback((deploymentId: string) => {
    // Get the deployment info from ref (always latest)
    const deployment = activeDeploymentsRef.current.get(deploymentId);
    if (deployment) {
      // Update to success state - component auto-dismisses after default duration
      toast.updateGroupItem(deployment.toastId, {
        title: `${deploymentId} deployed successfully`,
        type: "success",
        action: undefined, // Remove cancel button
      });
    }
    // Update local state
    setActiveDeployments((prev) => {
      const next = new Map(prev);
      next.delete(deploymentId);
      return next;
    });
    deploymentTimeouts.delete(deploymentId);
  }, []);

  const cancelDeployment = React.useCallback((deploymentId: string) => {
    // Clear the auto-completion timeout
    const timeoutId = deploymentTimeouts.get(deploymentId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      deploymentTimeouts.delete(deploymentId);
    }

    // Get the deployment info from ref (always latest)
    const deployment = activeDeploymentsRef.current.get(deploymentId);
    if (deployment) {
      // Move to completed list with cancelled state
      toast.updateGroupItem(deployment.toastId, {
        title: `${deploymentId} deployment cancelled`,
        type: "error",
        action: undefined,
      });
    }
    // Update local state
    setActiveDeployments((prev) => {
      const next = new Map(prev);
      next.delete(deploymentId);
      return next;
    });
  }, []);

  const startDeployment = React.useCallback(() => {
    const deploymentId = generateDeploymentId();
    const branchName = deploymentCounter % 2 === 0 ? "main" : "develop";

    const toastId = toast.grouped({
      showCloseButton: false,
      groupId: "deployments",
      title: `${deploymentId} is building on app - ${branchName}`,
      type: "loading",
      action: {
        label: "Cancel",
        onClick: () => cancelDeployment(deploymentId),
      },
      groupSummary: ({ loadingCount }) =>
        loadingCount > 0
          ? `${loadingCount} deployments in progress`
          : "All deployments complete",
      groupAction: {
        label: "Show",
        expandedLabel: "Hide",
      },
    });

    if (toastId) {
      setActiveDeployments((prev) => {
        const next = new Map(prev);
        next.set(deploymentId, { toastId, name: `app - ${branchName}` });
        return next;
      });

      // Simulate deployment completion after 5-10 seconds
      const completionTime = 5000 + Math.random() * 5000;
      const timeoutId = setTimeout(() => {
        completeDeployment(deploymentId);
      }, completionTime);
      deploymentTimeouts.set(deploymentId, timeoutId);
    }
  }, [cancelDeployment, completeDeployment]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      deploymentTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      deploymentTimeouts.clear();
    };
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
      duration: 5000, // Dismiss entire toast 5s after last notification
      groupSummary: ({ totalCount }) =>
        `${totalCount} notification${totalCount !== 1 ? "s" : ""}`,
      groupAction: {
        label: "Show",
        expandedLabel: "Hide",
      },
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
