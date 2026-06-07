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
import { Eye, EyeOff, LoaderCircle, Orbit } from "lucide-react";
import { toast } from "sonner";
import { AuthInputField } from "@/components/auth/auth-input-field";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import { Button } from "@/components/ui/button";
import {
  LOGIN_ROLE_CONTENT,
  LOGIN_ROLE_OPTIONS,
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
  if (value === "FACULTY") return "FACULTY";
  if (value === "ADMIN") return "ADMIN";
  return "STUDENT";
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
      className="w-full"
    >
      <div className="w-full bg-white border border-slate-200/70 rounded-[20px] shadow-xl shadow-slate-100/50 p-8 sm:p-10">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 mb-4">
            <Orbit className="size-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Welcome Back</h1>
          <p className="mt-2 text-sm text-[#64748B]">Access your academic workspace</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
          {formError ? (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {formError}
            </div>
          ) : null}

          {/* Role Switcher */}
          <div className="space-y-2">
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
          </div>

          {/* Input Fields */}
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
                      className="text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none"
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

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[#64748B] select-none cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-600/20"
              />
              Remember me
            </label>

            <a
              href={SYNTRA_FORGOT_PASSWORD_HREF}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <Button 
            className="h-11 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/10 transition-colors duration-200" 
            type="submit" 
            disabled={isSubmitting} 
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          <span className="text-slate-500 text-sm">
            Don't have an account?
          </span>
          <Link
            href="/auth/signup"
            className="ml-2 font-medium text-indigo-600 hover:text-indigo-700 text-sm hover:underline cursor-pointer"
          >
            Create Account
          </Link>
        </div>

      </div>
    </motion.section>
  );
}
