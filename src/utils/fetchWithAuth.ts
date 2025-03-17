export const fetchWithAuth = (url: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiQXJ0aGEifQ.U2IcJiBaS-seXP7oEuxuDKGOr-1QJMSQPkGRArP8hq4",
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
