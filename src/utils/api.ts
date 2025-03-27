import Cookies from 'js-cookie';

export const createAuthenticatedFetch = () => {
  return async (url: string, options: RequestInit = {}) => {
    const authToken = Cookies.get('auth_token');
    const idToken = Cookies.get('id_token');
    
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    try {
      // Ensure URL format is correct
      if (!url.includes('/dev/api/')) {
        url = url.replace('/api/', '/dev/api/');
      }

      const headers = new Headers({
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'X-ID-Token': idToken || ''
      });

      console.log('Request URL:', url);
      console.log('Request Headers:', Object.fromEntries(headers.entries()));

      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.status === 401) {
          throw new Error('Unauthorized - Please login again');
        }
        
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };
};