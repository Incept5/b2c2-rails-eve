import { RestClient } from './rest-client';

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
}

export async function ensureTestUser(client: RestClient, email: string = 'test@example.com'): Promise<TestUser> {
  try {
    // First try to find existing user
    const usersResponse = await client.get(`/api/users?email=${encodeURIComponent(email)}`);
    const users = usersResponse.body;

    console.log('users found:', users);
    
    if (users && Array.isArray(users) && users.length > 0) {
      const existingUser = users[0];
      // User exists, get auth token
      const authResponse = await client.post('/api/auth/token', {
        email,
        password: 'test1234',
        grant_type: 'password'
      });

      const auth = authResponse.body;
      if (!auth || !auth.access_token) {
        throw new Error('Failed to get auth token');
      }

      client.setAuthToken(auth.access_token);
      return {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        accessToken: auth.access_token
      };
    }

    // Create new test user
    const authResponse = await client.post('/api/auth/signup', {
      email,
      firstName: 'Test',
      lastName: 'User',
      password: 'test1234'
    });

    const auth = authResponse.body;
    if (!auth || !auth.access_token || !auth.user_id) {
      throw new Error('Failed to create test user');
    }

    client.setAuthToken(auth.access_token);
    return {
      id: auth.user_id,
      email,
      firstName: 'Test',
      lastName: 'User',
      accessToken: auth.access_token
    };
  } catch (error) {
    console.error('Error in ensureTestUser:', error);
    throw error;
  }
} 