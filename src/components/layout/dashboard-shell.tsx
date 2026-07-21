"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardNav, StoreBadge } from "./dashboard-nav";
import { ModeToggle } from "@/components/theme/mode-toggle";

type DashboardShellProps = {
  children: React.ReactNode;
  shopDomain?: string | null;
  userEmail?: string | null;
};

export function DashboardShell({ children, shopDomain, userEmail }: DashboardShellProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userEmail?.slice(0, 2).toUpperCase() ?? "PC";

  return (
    <div className="flex min-h-screen bg-dashboard-bg">
      <aside className="hidden w-[250px] shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-14 items-center border-b border-border px-6">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight">
            Payout Clarity
          </Link>
        </div>
        <div className="flex flex-1 flex-col py-4">
          <DashboardNav />
          <div className="mt-auto space-y-3 px-3 pb-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-muted-foreground">Appearance</span>
              <ModeToggle />
            </div>
            {shopDomain && <StoreBadge domain={shopDomain} />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm text-muted-foreground">{userEmail}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-14 items-center border-b px-6 font-semibold">
                Payout Clarity
              </div>
              <div className="py-4">
                <DashboardNav />
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Payout Clarity</span>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
