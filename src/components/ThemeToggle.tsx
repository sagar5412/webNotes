// src/components/ThemeToggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  isOpen?: boolean;
}

export default function ThemeToggle({ isOpen = true }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle(
        "light",
        savedTheme === "light"
      );
    } else if (systemPrefersDark) {
      setTheme("dark");
      document.documentElement.classList.remove("light");
    } else {
      setTheme("light");
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("light");
  };

  return (
    <Button
      variant="ghost"
      size={isOpen ? "default" : "icon"}
      onClick={toggleTheme}
      className={`
        w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors
        ${!isOpen && "justify-center px-0"}
      `}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      {isOpen && (
        <span className="ml-2">
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </Button>
  );
}
