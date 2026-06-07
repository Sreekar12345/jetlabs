"use client";

import { useState, type FocusEvent } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthInputField } from "@/components/auth/auth-input-field";
import { Button } from "@/components/ui/button";
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

type SignupFormProps = {
  activeRole: LoginRole;
  callbackUrl?: string | null;
};

export function SignupForm({ activeRole, callbackUrl }: SignupFormProps) {
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
    defaultValues: {
      ...DEFAULT_REGISTER_VALUES,
      role: activeRole,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Keep the role form value in sync with layout switcher
  const [lastRole, setLastRole] = useState(activeRole);
  if (activeRole !== lastRole) {
    setValue("role", activeRole);
    setLastRole(activeRole);
  }

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
      role: activeRole,
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
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </div>
      )}

      {/* Step 1: Basic Information */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Step 1: Basic Information
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                onChange={(e) => {
                  clearErrorState();
                  field.onChange(e);
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
                placeholder={activeRole === "STUDENT" || activeRole === "FACULTY" ? "your.email@college.edu" : "admin@college.edu"}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
                value={field.value}
                onChange={(e) => {
                  clearErrorState();
                  field.onChange(e);
                }}
                onBlur={(event) => {
                  field.onBlur();
                  normalizeField("email", event);
                }}
                error={errors.email?.message}
                inputRef={field.ref}
                disabled={isSubmitting}
                hint="Use your institution-issued email address."
              />
            )}
          />

          <div className="md:col-span-2">
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
                  onChange={(e) => {
                    clearErrorState();
                    field.onChange(e);
                  }}
                  onBlur={field.onBlur}
                  error={errors.phoneNumber?.message}
                  inputRef={field.ref}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Step 2: Academic Information */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Step 2: Academic Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {activeRole === "STUDENT" && (
            <>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label htmlFor="department" className="block text-sm font-medium text-foreground">
                      Department *
                    </label>
                    <select
                      id="department"
                      disabled={isSubmitting}
                      className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-foreground transition duration-200 focus-visible:outline-none focus-visible:border-indigo-600 focus-visible:ring-[3px] focus-visible:ring-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700"
                      value={field.value}
                      onChange={(e) => {
                        clearErrorState();
                        field.onChange(e);
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
                      <p className="text-sm text-destructive">{errors.department.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="batchYear"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label htmlFor="batchYear" className="block text-sm font-medium text-foreground">
                      Batch / Year *
                    </label>
                    <select
                      id="batchYear"
                      disabled={isSubmitting}
                      className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-foreground transition duration-200 focus-visible:outline-none focus-visible:border-indigo-600 focus-visible:ring-[3px] focus-visible:ring-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700"
                      value={field.value}
                      onChange={(e) => {
                        clearErrorState();
                        field.onChange(e);
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
                      <p className="text-sm text-destructive">{errors.batchYear.message}</p>
                    )}
                  </div>
                )}
              />

              <div className="md:col-span-2">
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
                      onChange={(e) => {
                        clearErrorState();
                        field.onChange(e);
                      }}
                      onBlur={field.onBlur}
                      error={errors.rollNumber?.message}
                      inputRef={field.ref}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </div>
            </>
          )}

          {activeRole === "FACULTY" && (
            <>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label htmlFor="department" className="block text-sm font-medium text-foreground">
                      Department *
                    </label>
                    <select
                      id="department"
                      disabled={isSubmitting}
                      className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-foreground transition duration-200 focus-visible:outline-none focus-visible:border-indigo-600 focus-visible:ring-[3px] focus-visible:ring-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700"
                      value={field.value}
                      onChange={(e) => {
                        clearErrorState();
                        field.onChange(e);
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
                      <p className="text-sm text-destructive">{errors.department.message}</p>
                    )}
                  </div>
                )}
              />

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
                    onChange={(e) => {
                      clearErrorState();
                      field.onChange(e);
                    }}
                    onBlur={field.onBlur}
                    error={errors.specialization?.message}
                    inputRef={field.ref}
                    disabled={isSubmitting}
                  />
                )}
              />
            </>
          )}

          {activeRole === "ADMIN" && (
            <div className="md:col-span-2">
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <AuthInputField
                    id="institutionName"
                    name={field.name}
                    type="text"
                    label="Institution Name *"
                    placeholder="e.g., Syntra University"
                    value={field.value}
                    onChange={(e) => {
                      clearErrorState();
                      field.onChange(e);
                    }}
                    onBlur={field.onBlur}
                    error={errors.department?.message}
                    inputRef={field.ref}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Security */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Step 3: Security
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <AuthInputField
                id="password"
                name={field.name}
                type={showPassword ? "text" : "password"}
                label="Password *"
                placeholder="••••••••"
                autoComplete="new-password"
                value={field.value}
                onChange={(e) => {
                  clearErrorState();
                  field.onChange(e);
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
                    className="text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none"
                    onClick={() => setShowPassword((curr) => !curr)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                id="confirmPassword"
                name={field.name}
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password *"
                placeholder="••••••••"
                autoComplete="new-password"
                value={field.value}
                onChange={(e) => {
                  clearErrorState();
                  field.onChange(e);
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
                    className="text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none"
                    onClick={() => setShowConfirmPassword((curr) => !curr)}
                    disabled={isSubmitting}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />
            )}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-base rounded-xl transition duration-200 shadow-md shadow-indigo-600/10"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-5 animate-spin mr-2" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </form>
  );
}
