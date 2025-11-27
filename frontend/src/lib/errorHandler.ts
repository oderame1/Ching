const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function handleApiError(error: any, defaultMessage: string = 'An error occurred'): string {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 
           error.response.data?.error || 
           `Server error: ${error.response.status} ${error.response.statusText}`;
  } else if (error.request) {
    // Request made but no response (network error)
    return `Network error: Cannot connect to backend at ${API_URL}. Make sure the backend server is running on port 3001.`;
  } else {
    // Something else happened
    return error.message || defaultMessage;
  }
}

