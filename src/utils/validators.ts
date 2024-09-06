import { prisma } from "../index.js";

export function isPasswordValid(password: string): string {
  const reg = new RegExp(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{6,}$/, "i");
  if (!reg.test(password)) {
    throw new Error("Password invalid");
  }
  return password;
}

export async function isEmailUnique(email: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (user != null) {
    throw new Error("Email already exist");
  }
  return email;
}
