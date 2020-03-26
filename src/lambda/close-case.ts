import { ICase } from './types';

export const handler = async (event: ICase): Promise<ICase> => {
  // Close the support case
  const Status = event.Status;
  const Case = event.Case;
  const Message = `${event.Message} closed.`;

  return { Case, Status, Message };
};
