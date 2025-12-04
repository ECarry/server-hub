import Link from "next/link";
import { NavLinks } from "./nav-links";
import { NavMenu } from "./nav-menu";
import { SearchButtonNav } from "./search-button-nav";

import Image from "next/image";
import AuthButton from "../auth-button";

export const HomeNavbar = async () => {
  return (
    <header className="z-50 sticky top-0 flex h-[100px] border-b md:border-transparent md:h-[72px] bg-background">
      <div className="w-full grid grid-cols-[min-content_auto_min-content] grid-rows-[1fr_auto] items-center gap-x-4 md:grid-cols-[1fr_minmax(auto,500px)_1fr] lg:grid-rows-1 px-5 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center">
            <div className="relative w-[128px] h-[64px]">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-5">
            <NavLinks />
          </div>
        </div>

        <div className="overflow-hidden px-1 py-2">
          <SearchButtonNav />
        </div>

        <div className="shrink-0 items-end">
          <div className="flex flex-row items-center justify-end gap-3">
            <AuthButton />
            <NavMenu />
          </div>
        </div>

        <div className="col-span-full row-start-2 flex md:hidden">
          <div className="flex items-center py-1 md:py-0 h-11 md:h-[unset] gap-x-4 md:gap-x-6">
            <NavLinks />
          </div>
        </div>
      </div>
    </header>
  );
};
