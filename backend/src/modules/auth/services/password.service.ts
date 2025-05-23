import { Injectable } from '@nestjs/common';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

@Injectable()
export class PasswordService {
  private readonly keyLength = 64;
  private readonly saltLength = 16;

  /**
   * Hash a password using scrypt with a random salt
   * @param password The plain text password to hash
   * @returns A string containing the salt and hash separated by a dot
   */
  async hash(password: string): Promise<string> {
    const salt = randomBytes(this.saltLength);
    const hash = (await scryptAsync(password, salt, this.keyLength)) as Buffer;
    return `${salt.toString('hex')}.${hash.toString('hex')}`;
  }

  /**
   * Verify a password against a hash
   * @param password The plain text password to verify
   * @param hashedPassword The stored hash (salt.hash format)
   * @returns True if the password matches, false otherwise
   */
  async verify(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [saltHex, hashHex] = hashedPassword.split('.');
      if (!saltHex || !hashHex) {
        return false;
      }

      const salt = Buffer.from(saltHex, 'hex');
      const storedHash = Buffer.from(hashHex, 'hex');
      
      const hash = (await scryptAsync(password, salt, this.keyLength)) as Buffer;
      
      return timingSafeEqual(storedHash, hash);
    } catch (error) {
      return false;
    }
  }
}
