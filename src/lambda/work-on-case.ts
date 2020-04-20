import { ICase } from './types';

const timeout = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const sleep = async (fn: Function, ...args: any) => {
  await timeout(3000);
  return fn(...args);
};

export const handler = async (event: ICase): Promise<ICase> => {
  // Generate a random number to determine whether the support case has been resolved, then return that value along with the updated message.
  const min = 0;
  const max = 1;
  const Status = Math.floor(Math.random() * (max - min + 1)) + min;
  const Case = event.Case;
  const statusMessage = Status ? 'resolved...' : 'unresolved...';
  const Message = `${event.Message}${statusMessage}`;

  if (!Status) {
    console.log('Case failed, timing out...');
    await timeout(6001);
  }

  return { Case, Status, Message };
};
