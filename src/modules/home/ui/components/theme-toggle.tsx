import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-full grid grid-cols-3 gap-1">
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        size="icon"
        onClick={() => setTheme("dark")}
        className="col-span-1 w-full"
      >
        <Moon className="h-5 w-5" />
      </Button>
      <Button
        variant={theme === "light" ? "default" : "outline"}
        size="icon"
        onClick={() => setTheme("light")}
        className="col-span-1 w-full"
      >
        <Sun className="h-5 w-5" />
      </Button>
      <Button
        variant={theme === "system" ? "default" : "outline"}
        size="icon"
        onClick={() => setTheme("system")}
        className="col-span-1 w-full"
      >
        <Monitor className="h-5 w-5" />
      </Button>
    </div>
  );
}
