"use client";

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/default/dialog/dialog";
import { Button } from "@/registry/default/button/button";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using our service, you agree to be bound by these terms. If you do not agree to all the terms, you may not access the service.",
  },
  {
    title: "2. User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.",
  },
  {
    title: "3. Intellectual Property",
    body: "The service and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.",
  },
  {
    title: "4. User Content",
    body: "You retain ownership of content you submit. By posting content, you grant us a license to use, modify, and display it in connection with the service.",
  },
  {
    title: "5. Prohibited Activities",
    body: "You may not use the service for any illegal purpose, to harass others, to distribute malware, or to interfere with the proper functioning of the service.",
  },
  {
    title: "6. Termination",
    body: "We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these terms or is harmful to other users.",
  },
  {
    title: "7. Limitation of Liability",
    body: "In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.",
  },
  {
    title: "8. Changes to Terms",
    body: "We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service.",
  },
  {
    title: "9. Governing Law",
    body: "These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions.",
  },
  {
    title: "10. Contact Information",
    body: "If you have any questions about these terms, please contact us at support@example.com. We will respond to your inquiry within a reasonable timeframe.",
  },
];

export default function DialogOutsideScroll() {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline">Terms of Service</Button>}
      />
      <DialogContent scroll="outside">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Please review our terms before continuing.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="mb-2 font-semibold">{section.title}</h3>
              <p className="text-muted-foreground text-sm">{section.body}</p>
            </section>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Decline</Button>} />
          <DialogClose render={<Button>Accept</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
