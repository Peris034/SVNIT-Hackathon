import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(4, "UserName must have at least 4 characters."),
  email: z.string().email("Invalid email format."),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords does not match.",
  path: ["confirmPassword"],
});
export const loginSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});