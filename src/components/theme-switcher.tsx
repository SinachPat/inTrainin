"use client";

import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeOption = {
  value: "default" | "graphite" | "sunrise";
  label: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  { value: "default", label: "Default" },
  { value: "graphite", label: "Graphite" },
  { value: "sunrise", label: "Sunrise" },
];

const STORAGE_KEY = "intrainin-theme";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeOption["value"]>(() => {
    if (typeof window === "undefined") {
      return "default";
    }
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeOption["value"] | null;
    return stored ?? "default";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const applyTheme = (value: ThemeOption["value"]) => {
    document.documentElement.setAttribute("data-theme", value);
    window.localStorage.setItem(STORAGE_KEY, value);
    setTheme(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <Badge variant="secondary" className="w-fit">
        <Palette data-icon="inline-start" />
        Theme
      </Badge>
      <div className="flex flex-wrap items-center gap-2">
        {THEME_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={theme === option.value ? "default" : "outline"}
            className={cn("min-w-24", theme === option.value && "shadow-sm")}
            onClick={() => applyTheme(option.value)}
          >
            {theme === option.value && <Check data-icon="inline-start" />}
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
