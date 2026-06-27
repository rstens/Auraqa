/**
 * Shared form input primitives.
 *
 * Centralizes the Tailwind class strings that the 5+ form components were
 * each duplicating. One place to change the focus ring color, border radius,
 * dark-mode treatment, etc.
 */

import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const fieldClasses =
  "block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm " +
  "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 " +
  "dark:border-slate-600 dark:bg-slate-800 dark:text-white";

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
        {hint && <span className="ml-1 text-xs text-slate-500">({hint})</span>}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClasses, className)} {...props} />;
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClasses, className)} {...props} />;
}

const buttonVariants = {
  primary:
    "rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50",
  secondary:
    "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50",
} as const;

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
}) {
  return (
    <button
      className={cn(buttonVariants[variant], className)}
      {...props}
    />
  );
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
    >
      {children}
    </div>
  );
}
