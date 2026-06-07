"use client";

import { useRef, type KeyboardEvent } from "react";
import type { LoginRole, RoleSwitcherOption } from "@/types/auth";
import { cn } from "@/lib/utils";

type RoleSwitcherProps = {
  value: LoginRole;
  onValueChange: (nextValue: LoginRole) => void;
  options: RoleSwitcherOption[];
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
};

export function RoleSwitcher({
  value,
  onValueChange,
  options,
  ariaLabel = "Select your role",
  disabled = false,
  className,
}: RoleSwitcherProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusRole(index: number) {
    buttonRefs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (disabled) {
      return;
    }

    let nextIndex = index;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (index + 1) % options.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (index - 1 + options.length) % options.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = options.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    onValueChange(options[nextIndex].value);
    focusRole(nextIndex);
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "grid gap-1 rounded-xl border border-slate-200/60 bg-slate-100/80 p-1",
        options.length === 3 ? "grid-cols-3" : "grid-cols-2",
        className,
      )}
    >
      {options.map((option, index) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "rounded-lg py-2.5 text-center text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/20",
              isActive
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200/20"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-white/40",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
