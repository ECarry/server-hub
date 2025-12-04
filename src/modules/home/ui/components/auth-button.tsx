"use client";

import { useSession } from "@/modules/auth/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bookmark, ArrowUpRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ThemeToggle from "@/modules/home/ui/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

const AuthButton = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Skeleton className="size-9 rounded-full" />;
  }

  if (!session) {
    return (
      <div className="hidden lg:flex flex-row items-center gap-3">
        <Button variant="ghost" size="lg" asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button variant="default" size="lg" asChild>
          <Link href="/login">Create free account</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 hover:opacity-80 transition-opacity cursor-pointer">
          <AvatarImage
            src={session.user.image || "#"}
            alt="Avatar"
            className="object-cover"
          />
          <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal select-none">
          <div className="flex flex-col gap-2">
            <h1 className="font-medium leading-none">{session.user.name}</h1>
            <p className="text-sm leading-none text-muted-foreground">
              {session.user.email}
            </p>
            <Button
              variant={"secondary"}
              className="mt-2 text-sm"
              onClick={() => {}}
            >
              Request content
            </Button>
          </div>

          <DropdownMenuSeparator />
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link
            className="flex justify-start items-center gap-x-2"
            href="/collections"
          >
            <Bookmark className="size-5" />
            <span>Collections</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <div
            className="flex justify-start items-center gap-x-2"
            onClick={() => {}}
          >
            <Settings className="size-5" />
            <span>Settings</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <ThemeToggle />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            className="flex justify-between items-center"
            href={"https://github.com/ECarry/server-hub-nextjs"}
            target="_blank"
          >
            <span>Github</span>
            <ArrowUpRight className="size-5" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            type="submit"
            className="w-full h-full cursor-pointer"
            onClick={() => {}}
          >
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButton;
