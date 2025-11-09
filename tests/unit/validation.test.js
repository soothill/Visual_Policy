/**
 * Unit tests for bucket name and ARN validation functions
 * Tests the core validation logic from policy-generator.js
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { setupTestEnvironment } from './test-setup.js';

let validateBucketName, validatePrincipalARN;

beforeAll(() => {
  const window = setupTestEnvironment();
  validateBucketName = window.validateBucketName;
  validatePrincipalARN = window.validatePrincipalARN;
});

describe('Bucket Name Validation', () => {
  describe('Valid bucket names', () => {
    test('should accept valid bucket name with lowercase letters', () => {
      const result = validateBucketName('mybucket');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept valid bucket name with numbers', () => {
      const result = validateBucketName('my-bucket-123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept valid bucket name with dots', () => {
      const result = validateBucketName('my.bucket.name');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept valid bucket name with hyphens', () => {
      const result = validateBucketName('my-bucket-name');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept 3-character bucket name', () => {
      const result = validateBucketName('abc');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept 63-character bucket name', () => {
      const result = validateBucketName('a'.repeat(63));
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid bucket names - length', () => {
    test('should reject bucket name less than 3 characters', () => {
      const result = validateBucketName('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name must be at least 3 characters long');
    });

    test('should reject bucket name more than 63 characters', () => {
      const result = validateBucketName('a'.repeat(64));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name cannot exceed 63 characters');
    });
  });

  describe('Invalid bucket names - character restrictions', () => {
    test('should reject bucket name with uppercase letters', () => {
      const result = validateBucketName('MyBucket');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name cannot contain uppercase letters');
    });

    test('should reject bucket name with underscores', () => {
      const result = validateBucketName('my_bucket');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name cannot contain underscores (_)');
    });

    test('should reject bucket name with special characters', () => {
      const result = validateBucketName('my@bucket');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject bucket name starting with hyphen', () => {
      const result = validateBucketName('-mybucket');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name must begin with a lowercase letter or number');
    });

    test('should reject bucket name ending with hyphen', () => {
      const result = validateBucketName('mybucket-');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name must end with a lowercase letter or number');
    });

    test('should reject bucket name starting with dot', () => {
      const result = validateBucketName('.mybucket');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name must begin with a lowercase letter or number');
    });

    test('should reject bucket name ending with dot', () => {
      const result = validateBucketName('mybucket.');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name must end with a lowercase letter or number');
    });
  });

  describe('Invalid bucket names - format restrictions', () => {
    test('should reject bucket name formatted as IP address', () => {
      const result = validateBucketName('192.168.1.1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Bucket name cannot be formatted as an IP address (e.g., 192.168.1.1)'
      );
    });

    test('should reject bucket name starting with xn--', () => {
      const result = validateBucketName('xn--mybucket');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name cannot start with "xn--"');
    });

    test('should reject bucket name ending with -s3alias', () => {
      const result = validateBucketName('mybucket-s3alias');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name cannot end with "-s3alias"');
    });

    test('should reject bucket name with adjacent periods', () => {
      const result = validateBucketName('my..bucket');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name cannot contain two adjacent periods (..)');
    });

    test('should reject bucket name with period adjacent to hyphen', () => {
      const result = validateBucketName('my.-bucket');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name cannot have a period adjacent to a hyphen');
    });

    test('should reject bucket name with hyphen adjacent to period', () => {
      const result = validateBucketName('my-.bucket');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bucket name cannot have a period adjacent to a hyphen');
    });
  });
});

describe('Principal ARN Validation', () => {
  describe('Valid principals', () => {
    test('should accept wildcard principal', () => {
      const result = validatePrincipalARN('*');
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0); // Should warn about public access
      expect(result.warnings[0]).toContain('public access');
    });

    test('should accept empty principal (optional)', () => {
      const result = validatePrincipalARN('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should accept valid AWS IAM user ARN', () => {
      const result = validatePrincipalARN('arn:aws:iam::123456789012:user/alice');
      expect(result.isValid).toBe(true);
    });

    test('should accept valid AWS IAM role ARN', () => {
      const result = validatePrincipalARN('arn:aws:iam::123456789012:role/S3AccessRole');
      expect(result.isValid).toBe(true);
    });

    test('should accept valid AWS IAM root ARN', () => {
      const result = validatePrincipalARN('arn:aws:iam::123456789012:root');
      expect(result.isValid).toBe(true);
    });

    test('should accept valid service principal', () => {
      const result = validatePrincipalARN('s3.amazonaws.com');
      expect(result.isValid).toBe(true);
    });

    test('should accept 64-character canonical user ID', () => {
      const canonicalId = 'a'.repeat(64);
      const result = validatePrincipalARN(canonicalId);
      expect(result.isValid).toBe(true);
    });

    test('should accept valid Impossible Cloud ARN', () => {
      const result = validatePrincipalARN('arn:ipcld:iam::MyCanonicalID:user/alice');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Invalid AWS ARNs', () => {
    test('should reject ARN with invalid format', () => {
      const result = validatePrincipalARN('arn:invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject IAM ARN with invalid account ID', () => {
      const result = validatePrincipalARN('arn:aws:iam::123:user/alice');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid ARN format');
    });

    test('should reject IAM ARN with non-numeric account ID', () => {
      const result = validatePrincipalARN('arn:aws:iam::abcdefghijkl:user/alice');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid ARN format');
    });

    test('should reject IAM ARN without resource', () => {
      const result = validatePrincipalARN('arn:aws:iam::123456789012:');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid ARN format');
    });

    test('should reject IAM ARN with invalid resource format', () => {
      const result = validatePrincipalARN('arn:aws:iam::123456789012:alice');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'IAM resource must be "root" or include type/name (e.g., user/username)'
      );
    });

    test('should reject invalid partition', () => {
      const result = validatePrincipalARN('arn:invalid:iam::123456789012:user/alice');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // The ARN regex fails first, giving a generic error
      expect(result.errors[0]).toContain('Invalid ARN format');
    });
  });

  describe('Impossible Cloud ARNs', () => {
    test('should accept Impossible Cloud IAM user ARN', () => {
      const result = validatePrincipalARN('arn:ipcld:iam::MyCanonicalID:user/alice');
      expect(result.isValid).toBe(true);
    });

    test('should accept Impossible Cloud IAM policy ARN', () => {
      const result = validatePrincipalARN('arn:ipcld:iam::MyCanonicalID:policy/MyPolicy');
      expect(result.isValid).toBe(true);
    });

    test('should reject Impossible Cloud ARN with non-IAM service', () => {
      const result = validatePrincipalARN('arn:ipcld:s3::MyCanonicalID:bucket/mybucket');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Impossible Cloud ARNs currently only support IAM service (arn:ipcld:iam::...)'
      );
    });

    test('should reject Impossible Cloud ARN without canonical ID', () => {
      const result = validatePrincipalARN('arn:ipcld:iam:::user/alice');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Impossible Cloud ARN requires a canonical ID (arn:ipcld:iam::YourCanonicalID:...)'
      );
    });

    test('should reject Impossible Cloud ARN without resource', () => {
      const result = validatePrincipalARN('arn:ipcld:iam::MyCanonicalID:');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Impossible Cloud ARN requires a resource (e.g., user/username, policy/policyname)'
      );
    });
  });

  describe('Account IDs', () => {
    test('should warn for bare account ID', () => {
      const result = validatePrincipalARN('123456789012');
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Consider using full ARN format');
    });

    test('should reject invalid principal format', () => {
      const result = validatePrincipalARN('not-a-valid-principal');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Service Principals', () => {
    test('should accept s3.amazonaws.com', () => {
      const result = validatePrincipalARN('s3.amazonaws.com');
      expect(result.isValid).toBe(true);
    });

    test('should accept ec2.amazonaws.com', () => {
      const result = validatePrincipalARN('ec2.amazonaws.com');
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid service principal format', () => {
      // Service principals that don't match expected patterns are caught as invalid
      const result = validatePrincipalARN('not-a-valid-arn-or-principal');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
