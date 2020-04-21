interface ErrorPayload {
  Error: string;
  Cause: string;
}

export const handler = async (error: ErrorPayload): Promise<any> => {
  const details = JSON.parse(error.Cause);
  console.log('Error received', details);
  return {Message: `Process failed due to: \\"${details.errorMessage}\\"`};
}
