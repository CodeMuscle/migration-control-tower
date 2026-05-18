/**
 * @migrationtower/ui — Shared React design system: Tailwind preset +
 * shadcn/ui primitives. Apps import the preset in their tailwind.config and
 * `@migrationtower/ui/styles.css` once at the root.
 */
export const PACKAGE_NAME = "@migrationtower/ui" as const;

export { cn } from "./lib/cn.js";
export { Button, buttonVariants, type ButtonProps } from "./components/button.js";
export { default as tailwindPreset } from "./tailwind-preset.js";
