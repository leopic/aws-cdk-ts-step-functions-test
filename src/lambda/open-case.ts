import { IInput, ICase } from './types';

export const handler = async (event: IInput): Promise<ICase> => {
  // Create a support case using the input as the case ID, then return a confirmation message
  const Case = event.inputCaseID;
  const Message = `Case ${Case}: opened...`;

  return { Case, Message };
};
