import type { ComponentProps, ReactNode, Ref } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthInputFieldProps = ComponentProps<typeof Input> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  inputRef?: Ref<HTMLInputElement>;
  trailingContent?: ReactNode;
};

export function AuthInputField({
  id,
  label,
  error,
  hint,
  inputRef,
  trailingContent,
  className,
  ...props
}: AuthInputFieldProps) {
  const messageId = `${id}-message`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(trailingContent ? "pr-12" : "", className)}
          {...props}
        />
        {trailingContent ? (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {trailingContent}
          </div>
        ) : null}
      </div>
      {error ? (
        <p id={messageId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
