import { GraphQLFormattedError } from "graphql";
import { unwrapResolverError } from "@apollo/server/errors";
import { CustomError } from "./error.js";

export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown,
) {
  const unwrappedError = unwrapResolverError(error);

  if (unwrappedError instanceof CustomError) {
    return {
      message: unwrappedError.message,
      code: unwrappedError.code,
      additionalInfo: unwrappedError.additionalInfo,
    };
  } else {
    return {
      message: "Erro no servidor. Por favor, tente novamente",
      code: 500,
      additionalInfo: formattedError.message,
    };
  }
}
