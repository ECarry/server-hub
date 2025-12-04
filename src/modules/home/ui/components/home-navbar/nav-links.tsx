"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { name: "Home", link: "/" },
  { name: "Blog", link: "/blog" },
  { name: "About", link: "/about" },
];

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menus.map((menu) => (
        <Link
          key={menu.link}
          href={menu.link}
          className={
            menu.link === pathname
              ? "text-primary"
              : "text-muted-foreground hover:text-primary transition-colors duration-200"
          }
        >
          {menu.name}
        </Link>
      ))}
    </>
  );
};
