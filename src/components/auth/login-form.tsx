"use client";

import { useEffect, useState, type FocusEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, LoaderCircle, Orbit, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthInputField } from "@/components/auth/auth-input-field";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AUTH_ASSURANCE_ICON,
  AUTH_SELF_SERVICE_NOTE,
  LOGIN_ROLE_CONTENT,
  LOGIN_ROLE_OPTIONS,
  SYNTRA_BRAND_NAME,
  SYNTRA_FORGOT_PASSWORD_HREF,
} from "@/lib/auth/presentation";
import { getSafeCallbackUrl } from "@/lib/auth/routing";
import { loginWithEmailPassword } from "@/services/auth-service";
import type { LoginRole } from "@/types/auth";
import {
  loginSchema,
  type LoginFormValues,
  type LoginInput,
} from "@/validations";

const DEFAULT_LOGIN_VALUES: LoginFormValues = {
  role: "STUDENT",
  email: "",
  password: "",
};

const REMEMBER_ME_KEY = "syntra.auth.prefill";
const AssuranceIcon = AUTH_ASSURANCE_ICON ?? ShieldCheck;

function getLoginReasonMessage(reason: string | null) {
  switch (reason) {
    case "expired":
      return "Your session expired. Please sign in again.";
    case "unauthorized":
      return "Please sign in to continue.";
    default:
      return null;
  }
}

function normalizeSelectedRole(value: unknown): LoginRole {
  return value === "FACULTY" ? "FACULTY" : "STUDENT";
}

type LoginFormProps = {
  callbackUrl?: string | null;
  reason?: string | null;
};

export function LoginForm({ callbackUrl, reason }: LoginFormProps) {
  const router = useRouter();
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      return Boolean(window.localStorage.getItem(REMEMBER_ME_KEY));
    } catch {
      return false;
    }
  });
  const [formError, setFormError] = useState<string | null>(
    getLoginReasonMessage(reason ?? null),
  );
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues, undefined, LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEFAULT_LOGIN_VALUES,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const activeRole = normalizeSelectedRole(
    useWatch({
      control,
      name: "role",
      defaultValue: DEFAULT_LOGIN_VALUES.role,
    }),
  );
  const roleContent = LOGIN_ROLE_CONTENT[activeRole];

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(REMEMBER_ME_KEY);

      if (!rawValue) {
        return;
      }

      const parsed = JSON.parse(rawValue) as {
        email?: string;
        role?: LoginRole;
      };

      if (parsed.email) {
        setValue("email", parsed.email, { shouldDirty: false });
      }

      if (parsed.role) {
        setValue("role", normalizeSelectedRole(parsed.role), {
          shouldDirty: false,
        });
      }
    } catch {
      window.localStorage.removeItem(REMEMBER_ME_KEY);
    }
  }, [setValue]);

  function clearErrorState() {
    if (formError) {
      setFormError(null);
    }
  }

  function focusInvalidField(fieldErrors: FieldErrors<LoginFormValues>) {
    if (fieldErrors.email) {
      setFocus("email");
      return;
    }

    if (fieldErrors.password) {
      setFocus("password");
    }
  }

  function normalizeEmailOnBlur(event: FocusEvent<HTMLInputElement>) {
    setValue("email", event.target.value.trim().toLowerCase(), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function normalizePasswordOnBlur(event: FocusEvent<HTMLInputElement>) {
    setValue("password", event.target.value.trim(), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: LoginInput) {
    clearErrorState();

    try {
      if (rememberMe) {
        window.localStorage.setItem(
          REMEMBER_ME_KEY,
          JSON.stringify({ email: values.email, role: values.role }),
        );
      } else {
        window.localStorage.removeItem(REMEMBER_ME_KEY);
      }
    } catch {
      // Ignore storage failures and continue the sign-in flow.
    }

    const result = await loginWithEmailPassword(values, {
      callbackUrl: safeCallbackUrl,
    });

    if (!result.success) {
      setFormError(result.message);

      if (
        result.code === "NETWORK_ERROR" ||
        result.code === "SERVER_ERROR" ||
        result.code === "UNKNOWN_ERROR"
      ) {
        toast.error(result.message);
      }

      if (result.code === "INVALID_CREDENTIALS") {
        setFocus("password");
      }

      return;
    }

    toast.success("Signed in successfully.");
    router.replace(result.redirectTo);
  }

  function onInvalid(fieldErrors: FieldErrors<LoginFormValues>) {
    clearErrorState();
    focusInvalidField(fieldErrors);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-10"
    >
      <Card className="w-full max-w-xl border-border/80 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-6 border-b border-border/80 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted text-foreground">
                <Orbit className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-foreground">
                  {SYNTRA_BRAND_NAME}
                </p>
                <p className="text-sm text-muted-foreground">
                  Academic Operating System
                </p>
              </div>
            </div>

            <Badge variant="secondary">Institution verified</Badge>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {roleContent.eyebrow}
            </p>
            <h1 id="login-title" className="text-balance text-3xl">
              Sign in to your JetLabs workspace
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              {roleContent.description}
            </p>
          </div>

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSwitcher
                ariaLabel="Select sign-in role"
                value={normalizeSelectedRole(field.value)}
                options={LOGIN_ROLE_OPTIONS}
                disabled={isSubmitting}
                onValueChange={(nextValue) => {
                  clearErrorState();
                  field.onChange(nextValue);
                }}
              />
            )}
          />

          <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                <AssuranceIcon className="size-4 text-foreground" aria-hidden="true" />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {roleContent.accessNote}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
            {formError ? (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {formError}
              </div>
            ) : null}

            <div className="space-y-5">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <AuthInputField
                    id="email"
                    name={field.name}
                    type="email"
                    label="College email"
                    placeholder={roleContent.emailPlaceholder}
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    inputMode="email"
                    value={field.value}
                    onChange={(event) => {
                      clearErrorState();
                      field.onChange(event);
                    }}
                    onBlur={(event) => {
                      field.onBlur();
                      normalizeEmailOnBlur(event);
                    }}
                    error={errors.email?.message}
                    inputRef={field.ref}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <AuthInputField
                    id="password"
                    name={field.name}
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder={roleContent.passwordPlaceholder}
                    autoComplete="current-password"
                    value={field.value}
                    onChange={(event) => {
                      clearErrorState();
                      field.onChange(event);
                    }}
                    onBlur={(event) => {
                      field.onBlur();
                      normalizePasswordOnBlur(event);
                    }}
                    error={errors.password?.message}
                    inputRef={field.ref}
                    disabled={isSubmitting}
                    trailingContent={
                      <button
                        type="button"
                        className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                        onClick={() => setShowPassword((current) => !current)}
                        disabled={isSubmitting}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    }
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="size-4 rounded border border-border bg-muted text-foreground"
                />
                Remember my workspace
              </label>

              <a
                href={SYNTRA_FORGOT_PASSWORD_HREF}
                className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
              >
                Forgot password?
              </a>
            </div>

            <Button className="h-11 w-full" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Continue to workspace"
              )}
            </Button>

            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                New to JetLabs?{" "}
                <Link
                  className="font-medium text-foreground underline decoration-white/20 underline-offset-4 transition-colors hover:text-muted-foreground"
                  href="/auth/signup"
                >
                  Create a student account
                </Link>
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                {AUTH_SELF_SERVICE_NOTE}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.section>
  );
}
