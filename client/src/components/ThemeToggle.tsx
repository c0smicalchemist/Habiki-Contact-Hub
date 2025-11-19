import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 bg-muted rounded-md p-1">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="h-8 px-3 gap-2"
        data-testid="button-theme-light"
        aria-pressed={theme === 'light'}
      >
        <Sun className="h-4 w-4" />
        <span className="text-xs font-medium">Light</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="h-8 px-3 gap-2"
        data-testid="button-theme-dark"
        aria-pressed={theme === 'dark'}
      >
        <Moon className="h-4 w-4" />
        <span className="text-xs font-medium">Dark</span>
      </Button>
    </div>
  );
}
