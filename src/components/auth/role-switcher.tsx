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
        "grid gap-2 rounded-[24px] border border-border bg-muted p-1.5",
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
              "rounded-[18px] border px-4 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "border-black bg-black text-white shadow-none"
                : "border-transparent text-black/60 hover:bg-white hover:text-black",
            )}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className="mt-1 block text-xs leading-5 opacity-80">
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
