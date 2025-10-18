import { ValidationError } from "../types/error";

export const parseNumberOrThrow = (value: string, fieldName: string): number => {
  const num = Number(value);

  if (isNaN(num)) {
    throw new ValidationError(`Please enter only numbers for ${fieldName}.`);
  }

  return num;
};
