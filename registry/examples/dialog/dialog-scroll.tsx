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

export default function DialogScroll() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Terms of Service</Button>} />
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Please review our terms before continuing.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <section>
            <h3 className="mb-2 font-semibold">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground text-sm">
              By accessing or using our service, you agree to be bound by these
              terms. If you do not agree to all the terms, you may not access
              the service.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">2. User Accounts</h3>
            <p className="text-muted-foreground text-sm">
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities under your account.
              Notify us immediately of any unauthorized use.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">3. Intellectual Property</h3>
            <p className="text-muted-foreground text-sm">
              The service and its original content, features, and functionality
              are owned by us and are protected by international copyright,
              trademark, and other intellectual property laws.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">4. User Content</h3>
            <p className="text-muted-foreground text-sm">
              You retain ownership of content you submit. By posting content,
              you grant us a license to use, modify, and display it in
              connection with the service.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">5. Prohibited Activities</h3>
            <p className="text-muted-foreground text-sm">
              You may not use the service for any illegal purpose, to harass
              others, to distribute malware, or to interfere with the proper
              functioning of the service.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">6. Termination</h3>
            <p className="text-muted-foreground text-sm">
              We may terminate or suspend your account immediately, without
              prior notice, for conduct that we believe violates these terms or
              is harmful to other users.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">7. Limitation of Liability</h3>
            <p className="text-muted-foreground text-sm">
              In no event shall we be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              use of the service.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">8. Changes to Terms</h3>
            <p className="text-muted-foreground text-sm">
              We reserve the right to modify these terms at any time. We will
              notify users of significant changes via email or through the
              service.
            </p>
          </section>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Decline</Button>} />
          <DialogClose render={<Button>Accept</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
