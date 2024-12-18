import { RestClient } from './rest-client';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  accessToken: string;
}

export async function ensureTestUser(client: RestClient, email: string = 'test@example.com'): Promise<TestUser> {
  // First try to find existing user
  const existingUser = await client.get(`/api/users?email=${encodeURIComponent(email)}`);
  
  if (existingUser) {
    // User exists, get auth token
    const auth = await client.post('/api/auth/token', {
      email,
      password: 'test1234',
      grant_type: 'password'
    });

    return {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      accessToken: auth.access_token
    };
  }

  // Create new test user
  const auth = await client.post('/api/auth/signup', {
    email,
    name: 'Test User',
    password: 'test1234'
  });

  return {
    id: auth.user_id,
    email,
    name: 'Test User',
    accessToken: auth.access_token
  };
}