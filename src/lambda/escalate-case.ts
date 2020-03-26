import { ICase } from './types';

export const handler = async (event: ICase): Promise<ICase> => {
  // Escalate the support case
  const Case = event.Case;
  const Status = event.Status;
  const Message = `${event.Message} escalating`;

  return { Case, Status, Message };
};
