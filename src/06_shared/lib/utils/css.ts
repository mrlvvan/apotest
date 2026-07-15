import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["h1", "h2", "l", "m", "s", "xs"] }],
      h: [{ h: [(value: string) => /^\[\d+px\]$/.test(value)] }],
      w: [{ w: [(value: string) => /^\[\d+px\]$/.test(value)] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
