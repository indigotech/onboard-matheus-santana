import { CustomError } from "../error.js";
import { prisma } from "../prisma.js";

const PASSWORD_VALID_REGEX = new RegExp(
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{6,}$/,
  "i",
);

export function checkPasswordValid(password: string): string {
  if (!PASSWORD_VALID_REGEX.test(password)) {
    throw new CustomError(
      "Senha invalida",
      400,
      "A senha deve conter no mínimo 1 letra maiúscula, 1 letra minúscula, 1 numéro e 6 caracteres de tamanho",
    );
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
    throw new CustomError(
      "O email já existe",
      400,
      "O email na qual está tentando ser cadastrado já existe na base de dados",
    );
  }
  return email;
}
