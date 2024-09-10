import { prisma } from "../index.js";

const PASSWORD_VALID_REGEX = new RegExp(
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{6,}$/,
  "i",
);

export function checkPasswordValid(password: string): string {
  if (!PASSWORD_VALID_REGEX.test(password)) {
    throw new Error("Password invalid");
  }
  return password;
}

export async function checkEmailUnique(email: string): Promise<string> {
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
