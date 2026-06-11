/**
 * Zod validation schemas for authentication.
 * Used in both API routes (server validation) and forms (client validation).
 */
import { z } from "zod";
import { LOGIN_ROLES, type LoginRole } from "@/types/auth";

const emailAddressSchema = z.string().email("Enter a valid college email address");
const uppercaseCharacter = /[A-Z]/;
const lowercaseCharacter = /[a-z]/;
const numericCharacter = /\d/;

function trimString(value: string) {
  return value.trim();
}

function normalizeEmail(value: string) {
  return trimString(value).toLowerCase();
}

function normalizeLoginRole(value: unknown): LoginRole {
  if (value === "ADMIN") return "ADMIN";
  if (value === "FACULTY") return "FACULTY";
  return "STUDENT";
}

export const loginSchema = z
  .object({
    role: z.enum(LOGIN_ROLES).default("STUDENT"),
    email: z.string(),
    password: z.string(),
  })
  .transform(({ role, email, password }) => ({
    role,
    email: normalizeEmail(email),
    password: trimString(password),
  }))
  .superRefine((value, ctx) => {
    if (!value.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "College email is required",
      });
    } else if (!emailAddressSchema.safeParse(value.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Enter a valid college email address",
      });
    }

    if (!value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required",
      });
    }
  });

export const registerSchema = z
  .object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
    role: z.enum(["STUDENT", "FACULTY", "ADMIN"]).optional(),
    phoneNumber: z.string().nullable().optional(),
    department: z.string().nullable().optional(),
    batchYear: z.string().nullable().optional(),
    rollNumber: z.string().nullable().optional(),
    specialization: z.string().nullable().optional(),
  })
  .transform(({ name, email, password, role, phoneNumber, department, batchYear, rollNumber, specialization }) => ({
    name: trimString(name),
    email: normalizeEmail(email),
    password: trimString(password),
    role: role ?? "STUDENT",
    phoneNumber: phoneNumber ? trimString(phoneNumber) : null,
    department: department ? trimString(department) : null,
    batchYear: batchYear ? trimString(batchYear) : null,
    rollNumber: rollNumber ? trimString(rollNumber) : null,
    specialization: specialization ? trimString(specialization) : null,
  }))
  .superRefine((value, ctx) => {
    if (!value.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Name is required",
      });
    } else if (value.name.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Name must be at least 2 characters",
      });
    } else if (value.name.length > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Name is too long",
      });
    }

    if (!value.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email is required",
      });
    } else if (!emailAddressSchema.safeParse(value.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Enter a valid email address",
      });
    }

    if (!value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required",
      });
    } else if (value.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password must be at least 8 characters",
      });
    } else if (value.password.length > 72) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password must be 72 characters or fewer",
      });
    } else {
      if (!uppercaseCharacter.test(value.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must contain at least one uppercase letter",
        });
      }

      if (!lowercaseCharacter.test(value.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must contain at least one lowercase letter",
        });
      }

      if (!numericCharacter.test(value.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must contain at least one number",
        });
      }
    }
  });

export const registerFormSchema = z
  .object({
    role: z.enum(LOGIN_ROLES).default("STUDENT"),
    name: z.string(),
    email: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    phoneNumber: z.string().optional(),
    department: z.string().optional(),
    batchYear: z.string().optional(),
    rollNumber: z.string().optional(),
    specialization: z.string().optional(),
  })
  .transform(({ role, name, email, password, confirmPassword, phoneNumber, department, batchYear, rollNumber, specialization }) => ({
    role,
    name: trimString(name),
    email: normalizeEmail(email),
    password: trimString(password),
    confirmPassword: trimString(confirmPassword),
    phoneNumber: phoneNumber ? trimString(phoneNumber) : "",
    department: department ? trimString(department) : "",
    batchYear: batchYear ? trimString(batchYear) : "",
    rollNumber: rollNumber ? trimString(rollNumber) : "",
    specialization: specialization ? trimString(specialization) : "",
  }))
  .superRefine((value, ctx) => {
    if (!value.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Full name is required",
      });
    } else if (value.name.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Full name must be at least 2 characters",
      });
    }

    if (!value.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "College email is required",
      });
    } else if (!emailAddressSchema.safeParse(value.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Enter a valid college email address",
      });
    }

    if (!value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required",
      });
    } else if (value.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password must be at least 8 characters",
      });
    } else if (value.password.length > 72) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password must be 72 characters or fewer",
      });
    } else {
      if (!uppercaseCharacter.test(value.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must contain at least one uppercase letter",
        });
      }

      if (!lowercaseCharacter.test(value.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must contain at least one lowercase letter",
        });
      }

      if (!numericCharacter.test(value.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must contain at least one number",
        });
      }
    }

    if (!value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Confirm your password",
      });
    } else if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }

    if (value.role === "STUDENT") {
      if (!value.department || value.department === "Select Department") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["department"],
          message: "Department is required",
        });
      }
      if (!value.batchYear || value.batchYear === "Select Batch") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["batchYear"],
          message: "Batch/Year is required",
        });
      }
      if (!value.rollNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rollNumber"],
          message: "Roll number is required",
        });
      }
    }

    if (value.role === "FACULTY") {
      if (!value.department || value.department === "Select Department") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["department"],
          message: "Department is required",
        });
      }
    }
  });

export type LoginFormValues = z.input<typeof loginSchema>;
export type LoginInput = z.output<typeof loginSchema>;
export type RegisterFormValues = z.input<typeof registerFormSchema>;
export type RegisterFormInput = z.output<typeof registerFormSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginFieldOrder = ["email", "password"] as const;
export type LoginField = (typeof loginFieldOrder)[number];
export type LoginValidationErrors = Partial<Record<LoginField, string>>;

function getLoginValidationErrors(error: z.ZodError<LoginFormValues>) {
  const errors: LoginValidationErrors = {};

  for (const field of loginFieldOrder) {
    const message = error.issues.find((issue) => issue.path[0] === field)?.message;

    if (message) {
      errors[field] = message;
    }
  }

  return errors;
}

export function validateLoginInput(input: LoginFormValues):
  | {
      success: true;
      data: LoginInput;
    }
  | {
      success: false;
      data: LoginInput;
      errors: LoginValidationErrors;
      firstField: LoginField | null;
    } {
  const result = loginSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const data: LoginInput = {
    role: normalizeLoginRole(input.role),
    email: normalizeEmail(input.email),
    password: trimString(input.password),
  };
  const errors = getLoginValidationErrors(result.error);
  const firstField = loginFieldOrder.find((field) => errors[field]) ?? null;

  return {
    success: false,
    data,
    errors,
    firstField,
  };
}

export function validateLoginField(field: LoginField, input: LoginFormValues) {
  const result = validateLoginInput(input);

  if (result.success) {
    return undefined;
  }

  return result.errors[field];
}
