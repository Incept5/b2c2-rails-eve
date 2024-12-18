import { RestClient } from './rest-client';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  accessToken: string;
}

export async function ensureTestUser(client: RestClient, email: string = 'test@example.com'): Promise<TestUser> {
  try {
    // First try to find existing user
    const users = await client.get(`/api/users?email=${encodeURIComponent(email)}`);

    console.log('users found:', users);
    
    if (users && Array.isArray(users) && users.length > 0) {
      const existingUser = users[0];
      // User exists, get auth token
      const auth = await client.post('/api/auth/token', {
        email,
        password: 'test1234',
        grant_type: 'password'
      });

      if (!auth || !auth.access_token) {
        throw new Error('Failed to get auth token');
      }

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

    if (!auth || !auth.access_token || !auth.user_id) {
      throw new Error('Failed to create test user');
    }

    return {
      id: auth.user_id,
      email,
      name: 'Test User',
      accessToken: auth.access_token
    };
  } catch (error) {
    console.error('Error in ensureTestUser:', error);
    throw error;
  }
}