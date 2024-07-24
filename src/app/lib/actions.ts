"use server";

import { sql } from "@vercel/postgres";
import { signIn } from "#/auth";
import { User } from "./type-definitions";
import bcrypt from 'bcrypt';

export async function authenticate(prevState: string, formData: FormData) {
  console.log("authenticating", formData);
  await signIn("credentials", formData);
  // console.log("after");
}

export async function register(prevState: string | undefined, formData: FormData) {
  try {
  console.log("registering", formData);
  const hashedPassword = await bcrypt.hash(formData.get("password") as string, 10);

  const user = {
    email: formData.get("email") as string,
    password: hashedPassword,
    name: formData.get("name") as string,
  };
  // save the data to the user table
   let databaseUser = await createUser(user)

  // sign in the user and send email to welcome the new user
  await signIn("credentials", formData);

  // await sendEmail(user.email, user.name);
} catch (error) {
  console.error("Error registering user", error);
  throw new Error("Failed to register user.");
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
  console.log(user)

  try {
    const saveUser = await sql`
      INSERT INTO users (email, password, name)
      VALUES (${user.email}, ${user.password}, ${user.name})
    `;


    console.log("saveUser", saveUser);
    return saveUser;
  } catch (error: any) {
    //
    if ((error as Error & {code: string}).code === "23505") {
      throw new Error("Email already in use.");
    }
    return {
      message: "Failed to save user.",
    }
  }
}
