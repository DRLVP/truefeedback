import { z } from "zod";


export const usernameValidation = z
    .string()
    .min(5, "username must be at least 5 characters")
    .max(20, "username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]{3,20}$/, "username must not contain any special character and space");

export const signupSchema = z.object({
    username : usernameValidation,
    email: z.string().email({message: "invalid email address"}),
    password: z.string().min(8, "password must be at least 8 characters")
})
