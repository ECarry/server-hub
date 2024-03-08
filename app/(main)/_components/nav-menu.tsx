"use client";

import Link from "next/link";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useModal } from "@/hooks/use-modal-store";
import { signOut } from "next-auth/react";

import { Icons } from "@/components/icons";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Avatar from "/public/images/avatar.jpg";

export function NavMenu() {
  const user = useCurrentUser();
  const { onOpen } = useModal();

  const AvatarImage = user?.image ? user.image : Avatar;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {user ? (
          <div className="flex h-8 md:h-11 items-center gap-x-0 md:gap-x-2 rounded-full w-8 md:w-20 cursor-pointer justify-between pl-0 md:pl-[6px] pr-0 md:pr-[14px] border-0 md:border hover:bg-primary-foreground">
            <Image
              src={AvatarImage}
              alt="avatar"
              width={32}
              height={32}
              className="size-8 rounded-full"
            />
            <Icons.menu className="size-4 hidden md:block" />
          </div>
        ) : (
          <Button
            variant="outline"
            size="lg"
            className="w-11 px-0 cursor-pointer"
          >
            <Icons.menu className="size-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {user && (
          <>
            <DropdownMenuLabel className="font-normal select-none">
              <div className="flex flex-col gap-2">
                <h1 className="font-medium leading-none">{user.name}</h1>
                <p className="text-sm leading-none text-muted-foreground">
                  {user.email}
                </p>
                <Button
                  variant={"secondary"}
                  className="mt-2 text-sm"
                  onClick={() => onOpen("requestContent")}
                >
                  Request content
                </Button>
              </div>

              <DropdownMenuSeparator />
            </DropdownMenuLabel>
          </>
        )}

        <DropdownMenuItem asChild>
          <Link
            className="flex justify-start items-center gap-x-2"
            href="/collections"
          >
            <Icons.bookmark className="size-5" />
            <span>Collections</span>
          </Link>
        </DropdownMenuItem>

        {user && (
          <DropdownMenuItem asChild>
            <div
              className="flex justify-start items-center gap-x-2"
              onClick={() => onOpen("settings")}
            >
              <Icons.settings className="size-5" />
              <span>Settings</span>
            </div>
          </DropdownMenuItem>
        )}
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
            <Icons.arrowUpRight className="size-5" />
          </Link>
        </DropdownMenuItem>
        {user && (
          <DropdownMenuItem asChild>
            <button
              type="submit"
              className="w-full h-full cursor-pointer"
              onClick={() => signOut()}
            >
              Log out
            </button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
