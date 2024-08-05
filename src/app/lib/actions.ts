"use server";

import { sql } from "@vercel/postgres";
import { signIn } from "#/auth";
import { User } from "./type-definitions";
import bcrypt from 'bcrypt';
import { Resend } from "resend";
import { EmailTemplate } from "#/app/components/EmailTemplate";
import { z } from 'zod'
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation"

const resend = new Resend(process.env.RESEND_API_KEY);


export async function authenticate(prevState: string | void | undefined, formData: FormData) {
  console.log("authenticating", formData);
  let result = await signIn("credentials", formData);
  console.log("result", result);
}

const RegisterSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(8).max(100).trim(),
  name: z.string().min(2).max(100).trim(),
  confirmPassword: z.string().min(8).max(100).trim(),
})

const Register = RegisterSchema.omit({ confirmPassword: true })
const RegisterType = Register['_output']

const FullRegisterCheck = RegisterSchema.refine((data) => data.confirmPassword === data.password, {
  message: "Passwords do not match",
  path: ['confirmPassword']
})

export type RegisterState = {
  errors?: {
    email?: string[],
    password?: string[],
    name?: string[],
    confirmPassword?: string[] // Add a question mark to make it optional
  },
  message?: string | null
}

export async function register(prevState: RegisterState, formData: FormData) {
  try {

    const validatedFields = FullRegisterCheck.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      confirmPassword: formData.get("confirm-password")
    })

    if (!validatedFields.success) {
      return {
        message: 'Missing required field or invalid data',
        errors: validatedFields.error.flatten().fieldErrors
      }
    }

    const { email, password, name } = validatedFields.data

    console.log("registering", formData);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      email,
      name,
      password: hashedPassword,
    };
    // save the data to the user table
    let createdUser = await createUser(user)

    await sendEmail("Welcome to Invoice Manager", email, name);

    // sign in the user and send email to welcome the new user
    await signIn("credentials", formData);

    return {
      message: 'User registered successfully',
    }

  } catch (error: any) {

    console.error("Error registering user", error);

    if (error.code === '23505') {
      return {
        message: 'User already exists',
      }
    }

    return {
      message: 'Failed to register user',
    }
  }
}

export async function getUser(email: string) {
  console.log("getUser", email);
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    console.log("result", result);

    return result?.rows[0] as User;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch user.");
  }
}

export async function createUser(user: Omit<User, 'id'>) {
  console.log(user);

  const saveUser = await sql`
      INSERT INTO users (email, password, name)
      VALUES (${user.email}, ${user.password}, ${user.name})
    `;

  console.log("saveUser", saveUser);
  return saveUser;
}

export async function sendEmail(subject: string, email: string, name: string) {
  console.log("sendEmail", email, name);
  // send email to welcome the new user
  try {
    await resend.emails.send({
      from: "Oluwasetemi <send@oluwasetemi.dev>",
      to: [email],
      subject: subject,
      react: EmailTemplate({ name, subject }),
    })
  } catch (error) {
    console.error("Error sending email", error);
    throw new Error("Failed to send email.");
  }
}
