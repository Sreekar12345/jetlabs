"use client";

import { useState, type FocusEvent } from "react";
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
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Orbit,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AuthInputField } from "@/components/auth/auth-input-field";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AUTH_REQUEST_ACCESS_NOTE,
  AUTH_SELF_SERVICE_NOTE,
  LOGIN_ROLE_CONTENT,
  LOGIN_ROLE_OPTIONS,
  SYNTRA_ACCESS_REQUEST_HREF,
  SYNTRA_BRAND_NAME,
} from "@/lib/auth/presentation";
import { getSafeCallbackUrl } from "@/lib/auth/routing";
import { registerWithEmailPassword } from "@/services/auth-service";
import type { LoginRole } from "@/types/auth";
import {
  registerFormSchema,
  type RegisterFormInput,
  type RegisterFormValues,
  type RegisterInput,
} from "@/validations/auth";

const DEFAULT_REGISTER_VALUES: RegisterFormValues = {
  role: "STUDENT",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  department: "",
  batchYear: "",
  rollNumber: "",
  specialization: "",
};

function normalizeSelectedRole(value: unknown): LoginRole {
  if (value === "FACULTY") return "FACULTY";
  if (value === "ADMIN") return "ADMIN";
  return "STUDENT";
}

type RegisterFormProps = {
  callbackUrl?: string | null;
};

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const router = useRouter();
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues, undefined, RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: DEFAULT_REGISTER_VALUES,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const activeRole = normalizeSelectedRole(
    useWatch({
      control,
      name: "role",
      defaultValue: DEFAULT_REGISTER_VALUES.role,
    }),
  );
  const roleContent = LOGIN_ROLE_CONTENT[activeRole];

  function clearErrorState() {
    if (formError) {
      setFormError(null);
    }
  }

  function focusInvalidField(fieldErrors: FieldErrors<RegisterFormValues>) {
    if (fieldErrors.name) {
      setFocus("name");
      return;
    }

    if (fieldErrors.email) {
      setFocus("email");
      return;
    }

    if (fieldErrors.password) {
      setFocus("password");
      return;
    }

    if (fieldErrors.confirmPassword) {
      setFocus("confirmPassword");
      return;
    }

    if (fieldErrors.phoneNumber) {
      setFocus("phoneNumber");
      return;
    }

    if (fieldErrors.department) {
      setFocus("department");
      return;
    }

    if (fieldErrors.batchYear) {
      setFocus("batchYear");
      return;
    }

    if (fieldErrors.rollNumber) {
      setFocus("rollNumber");
      return;
    }

    if (fieldErrors.specialization) {
      setFocus("specialization");
    }
  }

  function normalizeField(
    field: "email" | "password" | "confirmPassword",
    event: FocusEvent<HTMLInputElement>,
  ) {
    const nextValue =
      field === "email"
        ? event.target.value.trim().toLowerCase()
        : event.target.value.trim();

    setValue(field, nextValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: RegisterFormInput) {
    clearErrorState();

    const payload: RegisterInput = {
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
      phoneNumber: values.phoneNumber || null,
      department: values.department || null,
      batchYear: values.batchYear || null,
      rollNumber: values.rollNumber || null,
      specialization: values.specialization || null,
    };

    const result = await registerWithEmailPassword(payload, {
      callbackUrl: safeCallbackUrl,
    });

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    toast.success("Account created successfully.");
    router.replace(result.redirectTo);
  }

  function onInvalid(fieldErrors: FieldErrors<RegisterFormValues>) {
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
      <Card className="w-full max-w-xl border-border/80 bg-card/95 backdrop-blur shadow-2xl">
        <CardHeader className="space-y-6 border-b border-border/80 pb-6">
          {activeRole === "STUDENT" ? (
            <div className="flex flex-col items-center text-center space-y-4 mb-2">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Users className="size-7" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Account</h1>
                <p className="text-sm text-slate-500 font-semibold mt-1">Student Registration</p>
              </div>
            </div>
          ) : activeRole === "FACULTY" ? (
            <div className="flex flex-col items-center text-center space-y-4 mb-2">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/25">
                <ShieldCheck className="size-7" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Account</h1>
                <p className="text-sm text-slate-500 font-semibold mt-1">Faculty Registration</p>
              </div>
            </div>
          ) : (
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
                    Role-aware onboarding
                  </p>
                </div>
              </div>

              <Badge variant="outline">
                Provisioned access
              </Badge>
            </div>
          )}

          {activeRole !== "STUDENT" && activeRole !== "FACULTY" && (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Faculty access
              </p>
              <h1 className="text-balance text-3xl">
                Join Syntra with institution-ready onboarding
              </h1>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                {roleContent.description}
              </p>
            </div>
          )}

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSwitcher
                ariaLabel="Select sign-up role"
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
        </CardHeader>

        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
            {formError ? (
              <div
                role="alert"
                className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {formError}
              </div>
            ) : null}

            <div className={cn("grid gap-5", (activeRole === "STUDENT" || activeRole === "FACULTY") ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <AuthInputField
                    id="name"
                    name={field.name}
                    type="text"
                    label={activeRole === "STUDENT" || activeRole === "FACULTY" ? "Full Name *" : "Full name"}
                    placeholder={activeRole === "STUDENT" || activeRole === "FACULTY" ? "Enter your full name" : "Aarav Sharma"}
                    autoComplete="name"
                    value={field.value}
                    onChange={(event) => {
                      clearErrorState();
                      field.onChange(event);
                    }}
                    onBlur={field.onBlur}
                    error={errors.name?.message}
                    inputRef={field.ref}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <AuthInputField
                    id="email"
                    name={field.name}
                    type="email"
                    label={activeRole === "STUDENT" || activeRole === "FACULTY" ? "Email Address *" : "College email"}
                    placeholder={activeRole === "STUDENT" || activeRole === "FACULTY" ? "your.email@college.edu" : roleContent.emailPlaceholder}
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
                      normalizeField("email", event);
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
                    label={activeRole === "STUDENT" || activeRole === "FACULTY" ? "Password *" : "Password"}
                    placeholder={activeRole === "STUDENT" || activeRole === "FACULTY" ? "••••••••" : "Use at least 8 characters"}
                    autoComplete="new-password"
                    value={field.value}
                    onChange={(event) => {
                      clearErrorState();
                      field.onChange(event);
                    }}
                    onBlur={(event) => {
                      field.onBlur();
                      normalizeField("password", event);
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

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <AuthInputField
                    id="confirm-password"
                    name={field.name}
                    type={showConfirmPassword ? "text" : "password"}
                    label={activeRole === "STUDENT" || activeRole === "FACULTY" ? "Confirm Password *" : "Confirm password"}
                    placeholder={activeRole === "STUDENT" || activeRole === "FACULTY" ? "••••••••" : "Repeat your password"}
                    autoComplete="new-password"
                    value={field.value}
                    onChange={(event) => {
                      clearErrorState();
                      field.onChange(event);
                    }}
                    onBlur={(event) => {
                      field.onBlur();
                      normalizeField("confirmPassword", event);
                    }}
                    error={errors.confirmPassword?.message}
                    inputRef={field.ref}
                    disabled={isSubmitting}
                    trailingContent={
                      <button
                        type="button"
                        className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        disabled={isSubmitting}
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    }
                  />
                )}
              />

              {(activeRole === "STUDENT" || activeRole === "FACULTY") && (
                <>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <AuthInputField
                        id="phoneNumber"
                        name={field.name}
                        type="text"
                        label="Phone Number"
                        placeholder="+91 98765 43210"
                        value={field.value}
                        onChange={(event) => {
                          clearErrorState();
                          field.onChange(event);
                        }}
                        onBlur={field.onBlur}
                        error={errors.phoneNumber?.message}
                        inputRef={field.ref}
                        disabled={isSubmitting}
                      />
                    )}
                  />

                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-foreground">Department *</label>
                        <select
                          id="department"
                          disabled={isSubmitting}
                          className="h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={(event) => {
                            clearErrorState();
                            field.onChange(event);
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        >
                          <option value="">Select Department</option>
                          <option value="CSE">CSE</option>
                          <option value="ECE">ECE</option>
                          <option value="EEE">EEE</option>
                          <option value="MECH">MECH</option>
                          <option value="CIVIL">CIVIL</option>
                        </select>
                        {errors.department?.message && (
                          <p className="text-xs text-red-500">{errors.department.message}</p>
                        )}
                      </div>
                    )}
                  />
                </>
              )}

              {activeRole === "STUDENT" && (
                <>
                  <Controller
                    name="batchYear"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-foreground">Batch/Year *</label>
                        <select
                          id="batchYear"
                          disabled={isSubmitting}
                          className="h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={field.value}
                          onChange={(event) => {
                            clearErrorState();
                            field.onChange(event);
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        >
                          <option value="">Select Batch</option>
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                          <option value="2029">2029</option>
                        </select>
                        {errors.batchYear?.message && (
                          <p className="text-xs text-red-500">{errors.batchYear.message}</p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    name="rollNumber"
                    control={control}
                    render={({ field }) => (
                      <AuthInputField
                        id="rollNumber"
                        name={field.name}
                        type="text"
                        label="Roll Number *"
                        placeholder="e.g., CSE2024001"
                        value={field.value}
                        onChange={(event) => {
                          clearErrorState();
                          field.onChange(event);
                        }}
                        onBlur={field.onBlur}
                        error={errors.rollNumber?.message}
                        inputRef={field.ref}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </>
              )}

              {activeRole === "FACULTY" && (
                <div className="md:col-span-2">
                  <Controller
                    name="specialization"
                    control={control}
                    render={({ field }) => (
                      <AuthInputField
                        id="specialization"
                        name={field.name}
                        type="text"
                        label="Specialization"
                        placeholder="e.g., Machine Learning, VLSI Design"
                        value={field.value}
                        onChange={(event) => {
                          clearErrorState();
                          field.onChange(event);
                        }}
                        onBlur={field.onBlur}
                        error={errors.specialization?.message}
                        inputRef={field.ref}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Use your institution-issued email. Passwords must include at least one uppercase letter, one lowercase letter, and one number.
              </p>
            </div>

            <Button 
              className={cn(
                "h-11 w-full font-semibold rounded-xl transition-all duration-200 shadow-md", 
                activeRole === "STUDENT" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10 border-0" 
                  : activeRole === "FACULTY"
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/10 border-0"
                    : ""
              )} 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Creating account...
                </>
              ) : activeRole === "STUDENT" || activeRole === "FACULTY" ? (
                "Create Account"
              ) : (
                "Create student account"
              )}
            </Button>

            <div className="space-y-3 text-center pt-2">
              <p className="text-sm text-slate-500 font-medium">
                Already have an account?{" "}
                <Link
                  className={cn(
                    "font-semibold hover:underline",
                    activeRole === "STUDENT" 
                      ? "text-blue-600" 
                      : activeRole === "FACULTY"
                        ? "text-purple-600"
                        : "text-blue-600"
                  )}
                  href="/auth/login"
                >
                  {activeRole === "STUDENT" || activeRole === "FACULTY" ? "Sign in instead" : "Sign in"}
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
