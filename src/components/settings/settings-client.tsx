"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ThemeSelect } from "@/components/theme/theme-select";

type SettingsClientProps = {
  shopDomain: string | null;
  userEmail: string;
};

export function SettingsClient({ shopDomain, userEmail }: SettingsClientProps) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/shopify/disconnect", { method: "POST" });
      if (res.ok) {
        toast.success("Shopify store disconnected");
        router.push("/connect");
        router.refresh();
      } else {
        toast.error("Failed to disconnect");
      }
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (res.ok) {
        toast.success("Account deleted");
        router.push("/");
        router.refresh();
      } else {
        toast.error("Failed to delete account");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and connections</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Appearance</CardTitle>
          <CardDescription>Choose light, dark, or match your system settings</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelect />
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Shopify Store</CardTitle>
          <CardDescription>
            {shopDomain ? `Connected to ${shopDomain}` : "No store connected"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shopDomain && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={disconnecting}>
                  Disconnect Shopify
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Shopify?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove your store connection and delete all synced payout data. You
                    can reconnect anytime.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDisconnect}>Disconnect</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Billing</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/billing" className={cn(buttonVariants({ variant: "outline" }))}>
            Manage billing
          </Link>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-destructive">Account</CardTitle>
          <CardDescription>Signed in as {userEmail}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Deleting your account permanently removes all payout data, Shopify connections, and
            subscription records. This action cannot be undone.
          </p>
          <Separator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  Type DELETE to confirm. All your data will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteConfirm !== "DELETE" || deleting}
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
