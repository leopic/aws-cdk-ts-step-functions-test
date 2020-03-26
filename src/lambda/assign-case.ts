import { ICase } from './types';

export const handler = async (event: ICase): Promise<ICase> => {
  // Assign the support case and update the status message
  const Case = event.Case;
  const Message = `${event.Message}assigned...`;

  return { Case, Message };
};
