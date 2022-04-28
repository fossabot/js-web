export function getErrorMessages(error): string[] {
  if (error.response?.data?.message) {
    if (typeof error.response.data.message === 'string') {
      return [error.response.data.message];
    } else if (error.response.data.message.length) {
      return error.response.data.message as string[];
    }
  } else if (Array.isArray(error.response?.data)) {
    return error.response.data;
  } else if (typeof error === 'string') {
    return [error];
  } else {
    return ['Something went wrong.'];
  }
}
