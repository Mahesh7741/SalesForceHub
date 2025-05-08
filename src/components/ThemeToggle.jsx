"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react"; // optional: install lucide-react

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return React.createElement(
    "button",
    {
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
      className: "p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:shadow transition",
      "aria-label": "Toggle Theme"
    },
    theme === "dark"
      ? React.createElement(Sun, { className: "w-5 h-5 text-yellow-400" })
      : React.createElement(Moon, { className: "w-5 h-5 text-gray-800" })
  );
}

export default ThemeToggle;
