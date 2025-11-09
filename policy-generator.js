/*
    Impossible Cloud Bucket Policy Generator - JavaScript
    Copyright (c) 2025 Darren Soothill. All rights reserved.
*/

let currentPolicy = null;

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Toggle category expansion/collapse
function toggleCategory(headerElement) {
  const category = headerElement.closest('.action-category');
  category.classList.toggle('collapsed');
}

// AWS S3 Bucket Name Validation
function validateBucketName(bucketName) {
  const errors = [];

  // Rule 1: Length must be between 3 and 63 characters
  if (bucketName.length < 3) {
    errors.push('Bucket name must be at least 3 characters long');
  }
  if (bucketName.length > 63) {
    errors.push('Bucket name cannot exceed 63 characters');
  }

  // Rule 2: Can only contain lowercase letters, numbers, dots (.), and hyphens (-)
  if (!/^[a-z0-9.-]+$/.test(bucketName)) {
    errors.push(
      'Bucket name can only contain lowercase letters, numbers, dots (.), and hyphens (-)'
    );
  }

  // Rule 3: Must begin and end with a letter or number
  if (!/^[a-z0-9]/.test(bucketName)) {
    errors.push('Bucket name must begin with a lowercase letter or number');
  }
  if (!/[a-z0-9]$/.test(bucketName)) {
    errors.push('Bucket name must end with a lowercase letter or number');
  }

  // Rule 4: Must not be formatted as an IP address
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(bucketName)) {
    errors.push('Bucket name cannot be formatted as an IP address (e.g., 192.168.1.1)');
  }

  // Rule 5: Must not start with 'xn--'
  if (bucketName.startsWith('xn--')) {
    errors.push('Bucket name cannot start with "xn--"');
  }

  // Rule 6: Must not end with '-s3alias'
  if (bucketName.endsWith('-s3alias')) {
    errors.push('Bucket name cannot end with "-s3alias"');
  }

  // Rule 7: Cannot contain two adjacent periods
  if (bucketName.includes('..')) {
    errors.push('Bucket name cannot contain two adjacent periods (..)');
  }

  // Rule 8: Cannot have a period adjacent to a hyphen
  if (bucketName.includes('.-') || bucketName.includes('-.')) {
    errors.push('Bucket name cannot have a period adjacent to a hyphen');
  }

  // Rule 9: Check for uppercase letters (already covered by regex but good to be explicit)
  if (/[A-Z]/.test(bucketName)) {
    errors.push('Bucket name cannot contain uppercase letters');
  }

  // Rule 10: Check for underscores
  if (bucketName.includes('_')) {
    errors.push('Bucket name cannot contain underscores (_)');
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

function updateBucketNameValidation() {
  const bucketNameInput = document.getElementById('bucketName');
  const validationDiv = document.getElementById('bucketNameValidation');
  const bucketName = bucketNameInput.value.trim();

  // Clear previous validation state
  bucketNameInput.classList.remove('valid', 'invalid');
  validationDiv.className = 'validation-message';
  validationDiv.textContent = '';

  // Don't validate if empty (will be caught by required field validation)
  if (!bucketName) {
    return { isValid: false, errors: ['Bucket name is required'] };
  }

  const validation = validateBucketName(bucketName);

  if (validation.isValid) {
    bucketNameInput.classList.add('valid');
    validationDiv.className = 'validation-message success';
    validationDiv.textContent = '✓ Valid bucket name';
  } else {
    bucketNameInput.classList.add('invalid');
    validationDiv.className = 'validation-message error';
    validationDiv.innerHTML = '✗ ' + validation.errors.join('<br>✗ ');
  }

  return validation;
}

// AWS ARN (Amazon Resource Name) Validation for Principal field
function validatePrincipalARN(principal) {
  const errors = [];
  const warnings = [];

  // Allow wildcard for public access
  if (principal === '*') {
    warnings.push('Using "*" grants public access - ensure this is intentional for security');
    return { isValid: true, errors: [], warnings: warnings };
  }

  // Allow empty (optional field)
  if (!principal || principal.trim() === '') {
    return { isValid: true, errors: [], warnings: [] };
  }

  // Check for canonical user ID (64-character hex string)
  if (/^[a-f0-9]{64}$/.test(principal)) {
    return {
      isValid: true,
      errors: [],
      warnings: ['Using canonical user ID - ensure this is an Impossible Cloud canonical ID'],
    };
  }

  // Check for service principals (e.g., s3.amazonaws.com)
  if (principal.includes('.amazonaws.com') || principal.includes('.amazon.com')) {
    if (!principal.match(/^[a-z0-9-]+\.(amazonaws\.com|amazon\.com)$/)) {
      errors.push('Service principal format should be: service-name.amazonaws.com');
    } else {
      warnings.push(
        '⚠ AWS service principals (*.amazonaws.com) may not be supported by Impossible Cloud. Use IAM user/role ARNs instead.'
      );
      return { isValid: true, errors: [], warnings: warnings };
    }
  }

  // Validate IAM ARN format
  if (principal.startsWith('arn:')) {
    const parts = principal.split(':');
    const partition = parts[1];

    // Impossible Cloud ARN format: arn:ipcld:iam::CanonicalID:policy/name or user/name
    if (partition === 'ipcld') {
      const service = parts[2];
      const canonicalId = parts[4];
      const resource = parts.slice(5).join(':');

      if (service !== 'iam') {
        errors.push(
          'Impossible Cloud ARNs currently only support IAM service (arn:ipcld:iam::...)'
        );
      }

      if (!canonicalId || canonicalId.length === 0) {
        errors.push(
          'Impossible Cloud ARN requires a canonical ID (arn:ipcld:iam::YourCanonicalID:...)'
        );
      }

      if (!resource || resource.length === 0) {
        errors.push(
          'Impossible Cloud ARN requires a resource (e.g., user/username, policy/policyname)'
        );
      } else if (!resource.includes('/')) {
        errors.push(
          'Impossible Cloud resource must include type/name (e.g., user/username, policy/policyname)'
        );
      }

      return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings,
      };
    }

    // AWS ARN format: arn:partition:service:region:account-id:resource
    const arnRegex = /^arn:(aws|aws-cn|aws-us-gov):([a-z0-9-]+):([a-z0-9-]*):([0-9]{12}|):(.+)$/;

    if (!arnRegex.test(principal)) {
      errors.push(
        'Invalid ARN format. Expected: arn:aws:service:region:account-id:resource or arn:ipcld:iam::CanonicalID:resource'
      );
    } else {
      const service = parts[2];
      const region = parts[3];
      const accountId = parts[4];
      const resource = parts.slice(5).join(':');

      // Validate partition
      if (!['aws', 'aws-cn', 'aws-us-gov'].includes(partition)) {
        errors.push(
          `Invalid partition "${partition}". Must be: aws, aws-cn, aws-us-gov, or ipcld (Impossible Cloud)`
        );
      }

      // Validate service (for S3 bucket policies, most common are IAM, S3, STS)
      const validServices = ['iam', 's3', 'sts'];
      const awsOnlyServices = [
        'ec2',
        'lambda',
        'cloudfront',
        'elasticloadbalancing',
        'rds',
        'dynamodb',
      ];

      if (!validServices.includes(service) && !awsOnlyServices.includes(service)) {
        warnings.push(
          `Service "${service}" is unusual for S3 bucket policies. Common services: iam, s3, sts`
        );
      } else if (awsOnlyServices.includes(service)) {
        warnings.push(
          `⚠ Service "${service}" is AWS-specific and not supported by Impossible Cloud. Use iam, s3, or sts instead.`
        );
      }

      // For IAM ARNs, validate account ID
      if (service === 'iam') {
        if (!accountId) {
          errors.push('IAM ARN requires a 12-digit account ID');
        } else if (!/^\d{12}$/.test(accountId)) {
          errors.push(`Account ID must be exactly 12 digits, got: ${accountId}`);
        }

        // Validate resource format
        if (!resource) {
          errors.push('IAM ARN requires a resource (e.g., user/username, role/rolename, or root)');
        } else {
          const validResourceTypes = [
            'user',
            'role',
            'group',
            'instance-profile',
            'root',
            'federated-user',
            'assumed-role',
          ];
          const resourceType = resource.split('/')[0];

          if (resource !== 'root' && !resource.includes('/')) {
            errors.push('IAM resource must be "root" or include type/name (e.g., user/username)');
          } else if (resource !== 'root' && !validResourceTypes.includes(resourceType)) {
            warnings.push(
              `Resource type "${resourceType}" may not be valid. Common types: user, role, root`
            );
          }
        }

        // IAM ARNs should not have region
        if (region && region !== '') {
          warnings.push('IAM ARNs typically do not specify a region');
        }
      }

      // For S3 ARNs
      if (service === 's3') {
        if (accountId && accountId !== '') {
          warnings.push('S3 ARNs typically do not include account ID');
        }
        if (region && region !== '') {
          warnings.push('S3 ARNs typically do not specify a region');
        }
      }
    }
  } else if (!principal.includes('.')) {
    // If it's not an ARN and not a service principal, it might be an account ID
    if (/^\d{12}$/.test(principal)) {
      warnings.push(
        'Using just an account ID. Consider using full ARN format: arn:aws:iam::123456789012:root'
      );
    } else {
      errors.push(
        'Principal must be "*", a valid ARN (arn:aws:... or arn:ipcld:...), canonical user ID (64-char hex), service principal (service.amazonaws.com), or 12-digit account ID'
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings,
  };
}

function getARNSuggestion(principal) {
  // If empty, show options
  if (!principal || principal.length === 0) {
    return {
      type: 'hint',
      message:
        '💡 Start typing: <code>*</code> for public, <code>arn:aws:iam::</code> for AWS IAM, <code>arn:ipcld:iam::</code> for Impossible Cloud, or 64-char hex for canonical ID',
    };
  }

  // If they're typing an ARN
  if (
    principal.startsWith('arn:') ||
    principal.startsWith('arn') ||
    principal.startsWith('ar') ||
    principal.startsWith('a')
  ) {
    const parts = principal.split(':');

    // Stage 1: Just started typing "arn"
    if (parts.length === 1 && !principal.includes(':')) {
      if ('arn:'.startsWith(principal)) {
        return {
          type: 'hint',
          message: '💡 Continue typing: <code>arn:</code>',
        };
      }
    }

    // Stage 2: Typed "arn:"
    if (parts.length === 2 && principal.endsWith(':')) {
      return {
        type: 'hint',
        message:
          '💡 Next: partition → <code>arn:aws:</code> for AWS, <code>arn:ipcld:</code> for Impossible Cloud',
      };
    }

    // Stage 3: Typing partition
    if (parts.length === 2 && !principal.endsWith(':')) {
      const partition = parts[1];
      if (partition === 'ipcld') {
        return {
          type: 'hint',
          message: '💡 Good! Impossible Cloud ARN. Now add service: <code>arn:ipcld:iam:</code>',
        };
      } else if ('ipcld'.startsWith(partition)) {
        return {
          type: 'hint',
          message:
            '💡 Continue: <code>ipcld</code> for Impossible Cloud or <code>aws</code> for AWS',
        };
      } else if (partition === 'aws' || partition === 'aws-cn' || partition === 'aws-us-gov') {
        return {
          type: 'hint',
          message: `💡 Good! Now add colon and service: <code>arn:${partition}:</code>`,
        };
      } else if (
        'aws'.startsWith(partition) ||
        'aws-cn'.startsWith(partition) ||
        'aws-us-gov'.startsWith(partition)
      ) {
        return {
          type: 'hint',
          message: '💡 Continue: <code>aws</code>, <code>aws-cn</code>, or <code>aws-us-gov</code>',
        };
      }
    }

    // Stage 4: Typed partition, now need service
    if (parts.length === 3 && principal.endsWith(':')) {
      const partition = parts[1];
      if (partition === 'ipcld') {
        return {
          type: 'hint',
          message:
            '💡 Next: service → <code>iam</code> (Impossible Cloud only supports IAM currently)',
        };
      } else {
        return {
          type: 'hint',
          message:
            '💡 Next: service → <code>iam</code>, <code>s3</code>, or <code>sts</code> then <code>:</code>',
        };
      }
    }

    // Stage 5: Typing service
    if (parts.length === 3 && !principal.endsWith(':')) {
      const partition = parts[1];
      const service = parts[2];

      if (partition === 'ipcld') {
        if (service === 'iam') {
          return {
            type: 'hint',
            message:
              '💡 Good! Now add <code>:</code> then region (leave empty): <code>arn:ipcld:iam:</code>',
          };
        } else if ('iam'.startsWith(service)) {
          return {
            type: 'hint',
            message: '💡 Continue: <code>iam</code>',
          };
        } else {
          return {
            type: 'hint',
            message: '💡 Impossible Cloud only supports <code>iam</code> service',
          };
        }
      } else if (['iam', 's3', 'sts'].includes(service)) {
        return {
          type: 'hint',
          message: `💡 Good! Now add colon and region: <code>arn:${partition}:${service}:</code> (usually empty for IAM/S3)`,
        };
      } else if (
        ['ec2', 'lambda', 'cloudfront', 'elasticloadbalancing', 'rds', 'dynamodb'].includes(service)
      ) {
        return {
          type: 'hint',
          message: `⚠ Warning: <code>${service}</code> is AWS-specific and not supported by Impossible Cloud. Use <code>iam</code>, <code>s3</code>, or <code>sts</code>`,
        };
      } else if (
        'iam'.startsWith(service) ||
        's3'.startsWith(service) ||
        'sts'.startsWith(service)
      ) {
        return {
          type: 'hint',
          message: '💡 Common services: <code>iam</code>, <code>s3</code>, <code>sts</code>',
        };
      }
    }

    // Stage 6: Typed service, now need region (usually empty)
    if (parts.length === 4 && principal.endsWith(':')) {
      const partition = parts[1];
      if (partition === 'ipcld') {
        return {
          type: 'hint',
          message:
            '💡 Next: region (leave empty for Impossible Cloud) → <code>:</code> then canonical ID',
        };
      } else {
        return {
          type: 'hint',
          message: '💡 Next: region (usually empty for IAM/S3) → <code>:</code> then account ID',
        };
      }
    }

    // Stage 7: Typing region (usually skipped)
    if (parts.length === 4 && !principal.endsWith(':')) {
      const partition = parts[1];
      if (partition === 'ipcld') {
        return {
          type: 'hint',
          message:
            '💡 Impossible Cloud ARNs leave region empty. Add <code>:</code> for canonical ID',
        };
      } else {
        return {
          type: 'hint',
          message: '💡 Most IAM/S3 ARNs leave region empty. Add <code>:</code> for account ID',
        };
      }
    }

    // Stage 8: Need account ID or canonical ID
    if (parts.length === 5 && principal.endsWith(':')) {
      const partition = parts[1];
      if (partition === 'ipcld') {
        return {
          type: 'hint',
          message:
            '💡 Next: Your Impossible Cloud canonical ID (alphanumeric string) then <code>:</code>',
        };
      } else {
        return {
          type: 'hint',
          message: '💡 Next: 12-digit account ID → <code>123456789012</code> then <code>:</code>',
        };
      }
    }

    // Stage 9: Typing account ID or canonical ID
    if (parts.length === 5 && !principal.endsWith(':')) {
      const accountId = parts[4];
      const partition = parts[1];
      const service = parts[2];

      if (partition === 'ipcld') {
        if (accountId.length === 0) {
          return {
            type: 'hint',
            message: '💡 Enter your Impossible Cloud canonical ID',
          };
        } else if (accountId.length > 0) {
          return {
            type: 'hint',
            message: '💡 Continue entering canonical ID, then add <code>:</code> for resource',
          };
        }
      } else {
        if (accountId.length === 0) {
          return {
            type: 'hint',
            message: '💡 Enter your 12-digit AWS account ID',
          };
        } else if (!/^\d+$/.test(accountId)) {
          return {
            type: 'error',
            message: '✗ Account ID must contain only digits',
          };
        } else if (accountId.length < 12) {
          const remaining = 12 - accountId.length;
          return {
            type: 'hint',
            message: `💡 Account ID: ${accountId.length}/12 digits (${remaining} more needed)`,
          };
        } else if (accountId.length === 12) {
          return {
            type: 'hint',
            message: `💡 Perfect! Now add <code>:</code> and resource (e.g., <code>user/username</code> or <code>root</code>)`,
          };
        } else {
          return {
            type: 'error',
            message: '✗ Account ID must be exactly 12 digits',
          };
        }
      }
    }

    // Stage 10: Need resource
    if (parts.length === 6 && principal.endsWith(':')) {
      const partition = parts[1];
      const service = parts[2];

      if (partition === 'ipcld') {
        return {
          type: 'hint',
          message:
            '💡 Next: resource → Examples: <code>user/alice</code>, <code>user/bob</code>, <code>policy/MyBucketPolicy</code>',
        };
      } else if (service === 'iam') {
        return {
          type: 'hint',
          message:
            '💡 Next: resource → Examples: <code>user/alice</code>, <code>role/S3AccessRole</code>, <code>group/Developers</code>, or <code>root</code>',
        };
      } else {
        return {
          type: 'hint',
          message: '💡 Next: resource identifier',
        };
      }
    }

    // Stage 11: Typing resource
    if (parts.length >= 6) {
      const partition = parts[1];
      const service = parts[2];
      const resource = parts.slice(5).join(':');

      if (partition === 'ipcld') {
        if (resource.includes('/')) {
          const resourceParts = resource.split('/');
          const resourceType = resourceParts[0];
          const resourceName = resourceParts[1];

          if (['user', 'policy'].includes(resourceType)) {
            if (resourceName && resourceName.length > 0) {
              return {
                type: 'success',
                message: `✓ Valid Impossible Cloud ${resourceType} ARN`,
              };
            } else {
              const examples =
                resourceType === 'user'
                  ? '<code>user/alice</code> or <code>user/bob</code>'
                  : '<code>policy/MyBucketPolicy</code> or <code>policy/ReadOnlyAccess</code>';
              return {
                type: 'hint',
                message: `💡 Add the ${resourceType} name. Examples: ${examples}`,
              };
            }
          } else if ('user'.startsWith(resourceType) || 'policy'.startsWith(resourceType)) {
            return {
              type: 'hint',
              message: '💡 Impossible Cloud supports: <code>user/</code> or <code>policy/</code>',
            };
          }
        } else if ('user'.startsWith(resource) || 'policy'.startsWith(resource)) {
          return {
            type: 'hint',
            message:
              '💡 Continue typing: <code>user/alice</code>, <code>user/bob</code>, or <code>policy/MyBucketPolicy</code>',
          };
        }
      } else if (service === 'iam') {
        if (resource === 'root') {
          return {
            type: 'success',
            message: '✓ Complete! This grants access to the entire AWS account',
          };
        } else if (resource.includes('/')) {
          const resourceParts = resource.split('/');
          const resourceType = resourceParts[0];
          const resourceName = resourceParts[1];

          if (['user', 'role', 'group'].includes(resourceType)) {
            if (resourceName && resourceName.length > 0) {
              return {
                type: 'success',
                message: `✓ Valid IAM ${resourceType} ARN`,
              };
            } else {
              const examples = {
                user: '<code>user/alice</code>, <code>user/developers/john</code>',
                role: '<code>role/S3AccessRole</code>, <code>role/service-role/MyLambdaRole</code>',
                group: '<code>group/Developers</code>, <code>group/Admins</code>',
              };
              return {
                type: 'hint',
                message: `💡 Add the ${resourceType} name. Examples: ${examples[resourceType]}`,
              };
            }
          } else if (
            'user'.startsWith(resourceType) ||
            'role'.startsWith(resourceType) ||
            'group'.startsWith(resourceType)
          ) {
            return {
              type: 'hint',
              message:
                '💡 Common types: <code>user/</code>, <code>role/</code>, <code>group/</code>',
            };
          }
        } else if (
          'user'.startsWith(resource) ||
          'role'.startsWith(resource) ||
          'group'.startsWith(resource) ||
          'root'.startsWith(resource)
        ) {
          return {
            type: 'hint',
            message:
              '💡 Continue typing: <code>user/alice</code>, <code>role/S3AccessRole</code>, <code>group/Developers</code>, or <code>root</code>',
          };
        }
      }
    }
  }

  // Check for service principals
  if (principal.includes('.') || principal.includes('amazonaws')) {
    if (principal.endsWith('.amazonaws.com') || principal.endsWith('.amazon.com')) {
      return {
        type: 'success',
        message: '✓ Valid service principal',
      };
    } else if (
      's3.amazonaws.com'.startsWith(principal) ||
      'ec2.amazonaws.com'.startsWith(principal)
    ) {
      return {
        type: 'hint',
        message: '💡 Common: <code>s3.amazonaws.com</code>, <code>ec2.amazonaws.com</code>',
      };
    } else if (principal.includes('amazonaws')) {
      return {
        type: 'hint',
        message: '💡 Service principal format: <code>service-name.amazonaws.com</code>',
      };
    }
  }

  // Check for wildcard
  if (principal === '*') {
    return {
      type: 'warning',
      message: '⚠ Wildcard grants public access - ensure this is intentional',
    };
  }

  // Check for account ID only
  if (/^\d+$/.test(principal)) {
    if (principal.length < 12) {
      return {
        type: 'hint',
        message: `💡 Account ID: ${principal.length}/12 digits (${12 - principal.length} more needed)`,
      };
    } else if (principal.length === 12) {
      return {
        type: 'warning',
        message:
          '⚠ Valid account ID. Consider using full ARN: <code>arn:aws:iam::' +
          principal +
          ':root</code>',
      };
    } else {
      return {
        type: 'error',
        message: '✗ Account ID must be exactly 12 digits',
      };
    }
  }

  // Fall back to full validation for complete/invalid entries
  return null;
}

function updatePrincipalValidation() {
  const principalInput = document.getElementById('principal');
  const validationDiv = document.getElementById('principalValidation');
  const principal = principalInput.value.trim();

  // Clear previous validation state
  principalInput.classList.remove('valid', 'invalid');
  validationDiv.className = 'validation-message';
  validationDiv.textContent = '';

  // Don't validate if empty (optional field)
  if (!principal) {
    validationDiv.className = 'validation-message hint';
    validationDiv.innerHTML = '💡 Optional: Use <code>*</code> for public access, or enter an ARN';
    return { isValid: true, errors: [], warnings: [] };
  }

  // Try progressive suggestion first
  const suggestion = getARNSuggestion(principal);

  if (suggestion) {
    if (suggestion.type === 'success') {
      principalInput.classList.add('valid');
      validationDiv.className = 'validation-message success';
      validationDiv.innerHTML = suggestion.message;
      return { isValid: true, errors: [], warnings: [] };
    } else if (suggestion.type === 'hint') {
      validationDiv.className = 'validation-message hint';
      validationDiv.innerHTML = suggestion.message;
      return { isValid: false, errors: [], warnings: [] };
    } else if (suggestion.type === 'warning') {
      principalInput.classList.add('valid');
      validationDiv.className = 'validation-message';
      validationDiv.style.display = 'block';
      validationDiv.style.background = '#fff8e1';
      validationDiv.style.borderLeft = '3px solid #ff9800';
      validationDiv.style.color = '#f57c00';
      validationDiv.innerHTML = suggestion.message;
      return { isValid: true, errors: [], warnings: [suggestion.message] };
    } else if (suggestion.type === 'error') {
      principalInput.classList.add('invalid');
      validationDiv.className = 'validation-message error';
      validationDiv.innerHTML = suggestion.message;
      return { isValid: false, errors: [suggestion.message], warnings: [] };
    }
  }

  // Fall back to full validation for complete entries
  const validation = validatePrincipalARN(principal);

  if (validation.isValid && validation.warnings.length === 0) {
    principalInput.classList.add('valid');
    validationDiv.className = 'validation-message success';
    validationDiv.textContent = '✓ Valid principal format';
  } else if (validation.isValid && validation.warnings.length > 0) {
    principalInput.classList.add('valid');
    validationDiv.className = 'validation-message';
    validationDiv.style.display = 'block';
    validationDiv.style.background = '#fff8e1';
    validationDiv.style.borderLeft = '3px solid #ff9800';
    validationDiv.style.color = '#f57c00';
    validationDiv.innerHTML = '⚠ ' + validation.warnings.join('<br>⚠ ');
  } else {
    principalInput.classList.add('invalid');
    validationDiv.className = 'validation-message error';
    validationDiv.innerHTML = '✗ ' + validation.errors.join('<br>✗ ');
  }

  return validation;
}

function loadTemplate(templateName) {
  const templates = {
    publicRead: {
      effect: 'Allow',
      actions: ['s3:GetObject'],
      resourcePath: '*',
      description: 'Public read access for all objects',
    },
    privateReadWrite: {
      effect: 'Allow',
      actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket'],
      resourcePath: '*',
      description: 'Private read/write access for specific IAM user',
    },
    crossAccount: {
      effect: 'Allow',
      actions: ['s3:GetObject', 's3:ListBucket'],
      resourcePath: '*',
      description: 'Cross-account access',
    },
    objectLockVersioning: {
      effect: 'Allow',
      actions: [
        // Basic read/write permissions
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        's3:ListBucket',
        's3:GetObjectAttributes',
        // Object Lock specific permissions
        's3:GetObjectLockConfiguration',
        's3:PutObjectLockConfiguration',
        's3:BypassGovernanceRetention',
        // Versioning permissions
        's3:GetBucketVersioning',
        's3:PutBucketVersioning',
        's3:ListBucketVersions',
        's3:GetObjectVersion',
        's3:DeleteObjectVersion',
        's3:GetObjectVersionAttributes',
      ],
      resourcePath: '*',
      description: 'Enable object lock and versioning with read/write access',
    },
  };

  const template = templates[templateName];
  if (!template) return;

  // Preserve user's bucket name - don't overwrite with template default
  document.getElementById('policyEffect').value = template.effect;
  // Principal field not set - not supported by Impossible Cloud
  document.getElementById('resourcePath').value = template.resourcePath;

  // Clear all checkboxes first
  document.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));

  // Check the template actions
  template.actions.forEach((action) => {
    const checkbox = document.querySelector(`input[value="${action}"]`);
    if (checkbox) checkbox.checked = true;
  });

  // Expand categories that have checked checkboxes
  const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked.s3-action');
  const categoriesToExpand = new Set();
  checkedCheckboxes.forEach((checkbox) => {
    const category = checkbox.closest('.action-category');
    if (category && category.classList.contains('collapsed')) {
      categoriesToExpand.add(category);
    }
  });
  categoriesToExpand.forEach((category) => {
    category.classList.remove('collapsed');
  });

  // Validate the loaded bucket name and principal
  updateBucketNameValidation();
  updatePrincipalValidation();

  showNotification(`Template loaded: ${templateName}`);
}

function generatePolicy() {
  const bucketName = document.getElementById('bucketName').value.trim();
  if (!bucketName) {
    showNotification('Please enter a bucket name', 'error');
    return;
  }

  // Validate bucket name against AWS standards
  const bucketValidation = validateBucketName(bucketName);
  if (!bucketValidation.isValid) {
    updateBucketNameValidation(); // Show validation errors
    showNotification(
      'Invalid bucket name. Please fix the errors shown below the bucket name field.',
      'error'
    );
    // Scroll to bucket name field
    document.getElementById('bucketName').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const effect = document.getElementById('policyEffect').value;
  // Principal field not used - not supported by Impossible Cloud
  const resourcePath = document.getElementById('resourcePath').value.trim() || '*';
  const customActions = document.getElementById('customActions').value.trim();
  const conditionText = document.getElementById('condition').value.trim();

  // Collect checked actions
  const actions = [];
  document.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
    actions.push(cb.value);
  });

  // Add custom actions
  if (customActions) {
    customActions.split('\n').forEach((action) => {
      const trimmedAction = action.trim();
      if (trimmedAction) actions.push(trimmedAction);
    });
  }

  if (actions.length === 0) {
    showNotification('Please select at least one action', 'error');
    return;
  }

  // Build resources array
  const resources = [];
  const needsBucketResource = actions.some(
    (a) => a === 's3:ListBucket' || a.startsWith('s3:GetBucket') || a.startsWith('s3:PutBucket')
  );
  const needsObjectResource = actions.some((a) => a.includes('Object'));

  if (needsBucketResource) {
    resources.push(`arn:aws:s3:::${bucketName}`);
  }
  if (needsObjectResource) {
    resources.push(`arn:aws:s3:::${bucketName}/${resourcePath}`);
  }
  if (resources.length === 0) {
    resources.push(`arn:aws:s3:::${bucketName}/*`);
  }

  // Build statement (Principal omitted - not supported by Impossible Cloud)
  const statement = {
    Sid: 'GeneratedPolicy' + Date.now(),
    Effect: effect,
    Action: actions.length === 1 ? actions[0] : actions,
    Resource: resources.length === 1 ? resources[0] : resources,
  };

  // Add condition if provided
  if (conditionText) {
    try {
      statement.Condition = JSON.parse(conditionText);
    } catch (e) {
      showNotification('Invalid JSON in Condition field', 'error');
      return;
    }
  }

  // Build full policy
  const policy = {
    Version: '2012-10-17',
    Statement: [statement],
  };

  currentPolicy = policy;
  document.getElementById('policyOutput').textContent = JSON.stringify(policy, null, 2);
  showNotification('Policy generated successfully!');
}

function copyPolicy() {
  const policyText = document.getElementById('policyOutput').textContent;
  navigator.clipboard
    .writeText(policyText)
    .then(() => {
      showNotification('Policy copied to clipboard!');
    })
    .catch(() => {
      showNotification('Failed to copy policy', 'error');
    });
}

function downloadPolicy() {
  const policyText = document.getElementById('policyOutput').textContent;
  const bucketName = document.getElementById('bucketName').value.trim() || 'bucket';
  const blob = new Blob([policyText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${bucketName}-policy.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification('Policy downloaded!');
}

function clearForm() {
  if (confirm('Are you sure you want to clear the form?')) {
    document.getElementById('bucketName').value = '';
    document.getElementById('policyEffect').value = 'Allow';
    document.getElementById('principal').value = '';
    document.getElementById('resourcePath').value = '';
    document.getElementById('customActions').value = '';
    document.getElementById('condition').value = '';
    document.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    document.getElementById('policyOutput').textContent =
      '{\n  "Version": "2012-10-17",\n  "Statement": []\n}\n\nClick "Generate Policy" to create your bucket policy...';
    currentPolicy = null;

    // Clear validation messages
    document.getElementById('bucketName').classList.remove('valid', 'invalid');
    document.getElementById('bucketNameValidation').className = 'validation-message';
    document.getElementById('bucketNameValidation').textContent = '';
    document.getElementById('principal').classList.remove('valid', 'invalid');
    document.getElementById('principalValidation').className = 'validation-message';
    document.getElementById('principalValidation').textContent = '';

    showNotification('Form cleared');
  }
}

function validatePolicy() {
  const policyText = document.getElementById('policyOutput').textContent;
  const errors = [];
  const warnings = [];

  // Step 1: Validate JSON syntax
  let policy;
  try {
    policy = JSON.parse(policyText);
  } catch (e) {
    showNotification('❌ Invalid JSON syntax: ' + e.message, 'error');
    return;
  }

  // Step 2: Validate root policy structure
  if (typeof policy !== 'object' || policy === null) {
    errors.push('Policy must be a JSON object');
  }

  // Step 3: Validate Version field
  if (!policy.Version) {
    errors.push('Missing required field: Version');
  } else if (typeof policy.Version !== 'string') {
    errors.push('Version must be a string');
  } else if (policy.Version !== '2012-10-17' && policy.Version !== '2008-10-17') {
    errors.push(`Invalid Version: "${policy.Version}". Must be "2012-10-17" or "2008-10-17"`);
  } else if (policy.Version === '2008-10-17') {
    warnings.push('Version "2008-10-17" is deprecated. Use "2012-10-17"');
  }

  // Step 4: Validate Statement array
  if (!policy.Statement) {
    errors.push('Missing required field: Statement');
  } else if (!Array.isArray(policy.Statement)) {
    errors.push('Statement must be an array');
  } else if (policy.Statement.length === 0) {
    errors.push('Statement array cannot be empty');
  } else {
    // Validate each statement
    policy.Statement.forEach((stmt, idx) => {
      validateStatement(stmt, idx, errors, warnings);
    });
  }

  // Step 5: Check for unknown root-level fields
  const validRootFields = ['Version', 'Id', 'Statement'];
  Object.keys(policy).forEach((key) => {
    if (!validRootFields.includes(key)) {
      warnings.push(`Unknown root-level field: "${key}"`);
    }
  });

  // Step 6: Validate Id field if present
  if (policy.Id && typeof policy.Id !== 'string') {
    errors.push('Id field must be a string');
  }

  // Display results
  if (errors.length > 0) {
    const errorMsg = '❌ Validation failed:\n• ' + errors.join('\n• ');
    showNotification(errorMsg, 'error');
  } else if (warnings.length > 0) {
    const warnMsg = '⚠️ Policy is valid but has warnings:\n• ' + warnings.join('\n• ');
    showNotification(warnMsg, 'warning');
  } else {
    showNotification('✅ Policy is valid and follows AWS best practices!', 'success');
  }
}

function validateStatement(stmt, idx, errors, warnings) {
  const prefix = `Statement[${idx}]`;

  // Check if statement is an object
  if (typeof stmt !== 'object' || stmt === null) {
    errors.push(`${prefix}: Must be an object`);
    return;
  }

  // Validate Sid (optional)
  if (stmt.Sid !== undefined) {
    if (typeof stmt.Sid !== 'string') {
      errors.push(`${prefix}: Sid must be a string`);
    } else if (!/^[a-zA-Z0-9]+$/.test(stmt.Sid)) {
      errors.push(`${prefix}: Sid must contain only alphanumeric characters`);
    }
  }

  // Validate Effect (required)
  if (!stmt.Effect) {
    errors.push(`${prefix}: Missing required field "Effect"`);
  } else if (stmt.Effect !== 'Allow' && stmt.Effect !== 'Deny') {
    errors.push(`${prefix}: Effect must be "Allow" or "Deny", got "${stmt.Effect}"`);
  }

  // Principal/NotPrincipal validation disabled - not supported by Impossible Cloud
  // Impossible Cloud bucket policies work without explicit principals
  // Access control is managed through IAM policies and access keys
  if (stmt.Principal) {
    warnings.push(
      `${prefix}: Principal field is not supported by Impossible Cloud and will be ignored`
    );
  }
  if (stmt.NotPrincipal) {
    warnings.push(
      `${prefix}: NotPrincipal field is not supported by Impossible Cloud and will be ignored`
    );
  }

  // Validate Action/NotAction (one required)
  if (!stmt.Action && !stmt.NotAction) {
    errors.push(`${prefix}: Missing "Action" or "NotAction"`);
  }
  if (stmt.Action && stmt.NotAction) {
    errors.push(`${prefix}: Cannot have both "Action" and "NotAction"`);
  }
  if (stmt.Action) {
    validateActions(stmt.Action, prefix + '.Action', errors, warnings);
  }
  if (stmt.NotAction) {
    validateActions(stmt.NotAction, prefix + '.NotAction', errors, warnings);
  }

  // Validate Resource/NotResource (one required)
  if (!stmt.Resource && !stmt.NotResource) {
    errors.push(`${prefix}: Missing "Resource" or "NotResource"`);
  }
  if (stmt.Resource && stmt.NotResource) {
    errors.push(`${prefix}: Cannot have both "Resource" and "NotResource"`);
  }
  if (stmt.Resource) {
    validateResources(stmt.Resource, prefix + '.Resource', errors, warnings);
  }
  if (stmt.NotResource) {
    validateResources(stmt.NotResource, prefix + '.NotResource', errors, warnings);
  }

  // Validate Condition (optional)
  if (stmt.Condition) {
    validateCondition(stmt.Condition, prefix + '.Condition', errors, warnings);
  }

  // Check for unknown statement fields
  const validStmtFields = [
    'Sid',
    'Effect',
    'Principal',
    'NotPrincipal',
    'Action',
    'NotAction',
    'Resource',
    'NotResource',
    'Condition',
  ];
  Object.keys(stmt).forEach((key) => {
    if (!validStmtFields.includes(key)) {
      warnings.push(`${prefix}: Unknown field "${key}"`);
    }
  });
}

function validatePrincipal(principal, prefix, errors, warnings) {
  if (principal === '*') {
    warnings.push(
      `${prefix}: Using wildcard (*) grants public access - ensure this is intentional`
    );
    return;
  }

  if (typeof principal === 'string') {
    errors.push(
      `${prefix}: String principals other than "*" are not valid. Use {"AWS": "..."} format`
    );
    return;
  }

  if (typeof principal !== 'object' || principal === null) {
    errors.push(`${prefix}: Must be "*" or an object`);
    return;
  }

  const validPrincipalKeys = ['AWS', 'Service', 'Federated', 'CanonicalUser'];
  Object.keys(principal).forEach((key) => {
    if (!validPrincipalKeys.includes(key)) {
      errors.push(
        `${prefix}: Unknown principal type "${key}". Valid types: ${validPrincipalKeys.join(', ')}`
      );
    }
  });

  // Validate AWS principals
  if (principal.AWS) {
    const awsPrincipals = Array.isArray(principal.AWS) ? principal.AWS : [principal.AWS];
    awsPrincipals.forEach((arn, idx) => {
      if (arn === '*') {
        warnings.push(`${prefix}.AWS[${idx}]: Using "*" grants public access`);
      } else if (typeof arn !== 'string') {
        errors.push(`${prefix}.AWS[${idx}]: Must be a string`);
      } else if (!arn.startsWith('arn:aws:iam::') && arn !== '*') {
        errors.push(`${prefix}.AWS[${idx}]: Invalid ARN format "${arn}"`);
      } else if (!/^\d{12}$/.test(arn.split('::')[1]?.split(':')[0] || '')) {
        warnings.push(`${prefix}.AWS[${idx}]: Account ID should be 12 digits`);
      }
    });
  }

  // Validate Service principals
  if (principal.Service) {
    const services = Array.isArray(principal.Service) ? principal.Service : [principal.Service];
    services.forEach((svc, idx) => {
      if (typeof svc !== 'string') {
        errors.push(`${prefix}.Service[${idx}]: Must be a string`);
      } else if (!svc.includes('.amazonaws.com') && svc !== 's3.amazonaws.com') {
        warnings.push(
          `${prefix}.Service[${idx}]: Service principal should typically end with .amazonaws.com`
        );
      }
    });
  }
}

function validateActions(actions, prefix, errors, warnings) {
  const actionList = Array.isArray(actions) ? actions : [actions];

  if (actionList.length === 0) {
    errors.push(`${prefix}: Cannot be empty`);
    return;
  }

  const validS3Actions = [
    's3:*',
    's3:GetObject',
    's3:PutObject',
    's3:DeleteObject',
    's3:GetObjectVersion',
    's3:DeleteObjectVersion',
    's3:GetObjectAcl',
    's3:PutObjectAcl',
    's3:GetObjectVersionAcl',
    's3:PutObjectVersionAcl',
    's3:GetObjectAttributes',
    's3:GetObjectVersionAttributes',
    's3:GetObjectTagging',
    's3:PutObjectTagging',
    's3:DeleteObjectTagging',
    's3:GetObjectVersionTagging',
    's3:PutObjectVersionTagging',
    's3:DeleteObjectVersionTagging',
    's3:GetObjectTorrent',
    's3:GetObjectVersionTorrent',
    's3:GetObjectAttributes',
    's3:GetObjectVersionAttributes',
    's3:ListBucket',
    's3:ListBucketVersions',
    's3:ListBucketMultipartUploads',
    's3:GetBucketLocation',
    's3:GetBucketVersioning',
    's3:PutBucketVersioning',
    's3:GetBucketAcl',
    's3:PutBucketAcl',
    's3:GetBucketCORS',
    's3:PutBucketCORS',
    's3:DeleteBucketCORS',
    's3:GetBucketWebsite',
    's3:PutBucketWebsite',
    's3:DeleteBucketWebsite',
    's3:GetBucketLogging',
    's3:PutBucketLogging',
    's3:GetBucketNotification',
    's3:PutBucketNotification',
    's3:GetBucketPolicy',
    's3:PutBucketPolicy',
    's3:DeleteBucketPolicy',
    's3:GetBucketRequestPayment',
    's3:PutBucketRequestPayment',
    's3:GetBucketTagging',
    's3:PutBucketTagging',
    's3:DeleteBucketTagging',
    's3:GetReplicationConfiguration',
    's3:PutReplicationConfiguration',
    's3:GetAccelerateConfiguration',
    's3:PutAccelerateConfiguration',
    's3:GetEncryptionConfiguration',
    's3:PutEncryptionConfiguration',
    's3:GetBucketObjectLockConfiguration',
    's3:PutBucketObjectLockConfiguration',
    's3:GetObjectLockConfiguration',
    's3:PutObjectLockConfiguration',
    's3:GetBucketPublicAccessBlock',
    's3:PutBucketPublicAccessBlock',
    's3:GetObjectLegalHold',
    's3:PutObjectLegalHold',
    's3:GetObjectRetention',
    's3:PutObjectRetention',
    's3:BypassGovernanceRetention',
    's3:AbortMultipartUpload',
    's3:ListMultipartUploadParts',
    's3:RestoreObject',
  ];

  actionList.forEach((action, idx) => {
    if (typeof action !== 'string') {
      errors.push(`${prefix}[${idx}]: Must be a string`);
    } else if (!action.includes(':')) {
      errors.push(`${prefix}[${idx}]: Invalid format "${action}". Must be "service:action"`);
    } else {
      const [service, actionName] = action.split(':');
      if (service !== 's3' && action !== '*') {
        warnings.push(`${prefix}[${idx}]: "${action}" is not an S3 action`);
      } else if (
        service === 's3' &&
        actionName !== '*' &&
        !validS3Actions.includes(action) &&
        !actionName.includes('*')
      ) {
        warnings.push(`${prefix}[${idx}]: "${action}" may not be a valid S3 action`);
      }
    }
  });
}

function validateResources(resources, prefix, errors, warnings) {
  const resourceList = Array.isArray(resources) ? resources : [resources];

  if (resourceList.length === 0) {
    errors.push(`${prefix}: Cannot be empty`);
    return;
  }

  resourceList.forEach((resource, idx) => {
    if (typeof resource !== 'string') {
      errors.push(`${prefix}[${idx}]: Must be a string`);
    } else if (!resource.startsWith('arn:aws:s3:::') && resource !== '*') {
      errors.push(`${prefix}[${idx}]: Must be a valid S3 ARN (arn:aws:s3:::...) or "*"`);
    } else if (resource.startsWith('arn:aws:s3:::')) {
      const bucketPart = resource.substring(13); // Remove 'arn:aws:s3:::'
      if (bucketPart === '') {
        errors.push(`${prefix}[${idx}]: Missing bucket name in ARN`);
      } else if (bucketPart.includes('//')) {
        errors.push(`${prefix}[${idx}]: Invalid path - contains double slashes`);
      }

      // Check if it's a bucket ARN (no /) vs object ARN (has /)
      const hasPath = bucketPart.includes('/');
      if (!hasPath && bucketPart.length > 63) {
        errors.push(`${prefix}[${idx}]: Bucket name too long (max 63 characters)`);
      }
      if (!hasPath && !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(bucketPart)) {
        warnings.push(`${prefix}[${idx}]: Bucket name may not follow S3 naming rules`);
      }
    }
  });
}

function validateCondition(condition, prefix, errors, warnings) {
  if (typeof condition !== 'object' || condition === null || Array.isArray(condition)) {
    errors.push(`${prefix}: Must be an object`);
    return;
  }

  const validConditionOperators = [
    // String operators
    'StringEquals',
    'StringNotEquals',
    'StringLike',
    'StringNotLike',
    'StringEqualsIgnoreCase',
    'StringNotEqualsIgnoreCase',
    // String operators with IfExists
    'StringEqualsIfExists',
    'StringNotEqualsIfExists',
    'StringLikeIfExists',
    'StringNotLikeIfExists',
    'StringEqualsIgnoreCaseIfExists',
    'StringNotEqualsIgnoreCaseIfExists',
    // Numeric operators
    'NumericEquals',
    'NumericNotEquals',
    'NumericLessThan',
    'NumericLessThanEquals',
    'NumericGreaterThan',
    'NumericGreaterThanEquals',
    // Numeric operators with IfExists
    'NumericEqualsIfExists',
    'NumericNotEqualsIfExists',
    'NumericLessThanIfExists',
    'NumericLessThanEqualsIfExists',
    'NumericGreaterThanIfExists',
    'NumericGreaterThanEqualsIfExists',
    // Date operators
    'DateEquals',
    'DateNotEquals',
    'DateLessThan',
    'DateLessThanEquals',
    'DateGreaterThan',
    'DateGreaterThanEquals',
    // Date operators with IfExists
    'DateEqualsIfExists',
    'DateNotEqualsIfExists',
    'DateLessThanIfExists',
    'DateLessThanEqualsIfExists',
    'DateGreaterThanIfExists',
    'DateGreaterThanEqualsIfExists',
    // Boolean and Binary
    'Bool',
    'BinaryEquals',
    'BoolIfExists',
    'BinaryEqualsIfExists',
    // IP Address operators
    'IpAddress',
    'NotIpAddress',
    'IpAddressIfExists',
    'NotIpAddressIfExists',
    // ARN operators
    'ArnEquals',
    'ArnLike',
    'ArnNotEquals',
    'ArnNotLike',
    'ArnEqualsIfExists',
    'ArnLikeIfExists',
    'ArnNotEqualsIfExists',
    'ArnNotLikeIfExists',
    // Null check
    'Null',
  ];

  Object.keys(condition).forEach((operator) => {
    // Handle ForAllValues: and ForAnyValue: prefixes (used for set operations)
    let operatorToCheck = operator;
    if (operator.startsWith('ForAllValues:') || operator.startsWith('ForAnyValue:')) {
      operatorToCheck = operator.split(':')[1];
    }

    if (!validConditionOperators.includes(operatorToCheck)) {
      errors.push(`${prefix}: Unknown condition operator "${operator}"`);
    }

    const conditionBlock = condition[operator];
    if (
      typeof conditionBlock !== 'object' ||
      conditionBlock === null ||
      Array.isArray(conditionBlock)
    ) {
      errors.push(`${prefix}.${operator}: Must be an object`);
    }
  });
}

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.whiteSpace = 'pre-line';
  notification.style.textAlign = 'left';
  notification.style.maxWidth = '500px';

  if (type === 'error') {
    notification.style.background = '#dc3545';
  } else if (type === 'warning') {
    notification.style.background = '#ff9800';
  } else {
    notification.style.background = '#28a745';
  }

  notification.classList.add('show');
  const timeout = type === 'error' || type === 'warning' ? 8000 : 3000;
  setTimeout(() => {
    notification.classList.remove('show');
  }, timeout);
}

// Initialize with default empty policy
window.onload = function () {
  // Add real-time validation for bucket name with debouncing
  const bucketNameInput = document.getElementById('bucketName');

  // Debounced validation function (300ms delay)
  const debouncedBucketValidation = debounce(function () {
    if (bucketNameInput.value.trim().length > 0) {
      updateBucketNameValidation();
    } else {
      bucketNameInput.classList.remove('valid', 'invalid');
      document.getElementById('bucketNameValidation').className = 'validation-message';
      document.getElementById('bucketNameValidation').textContent = '';
    }
  }, 300);

  // Validate on input (as user types) - debounced
  bucketNameInput.addEventListener('input', debouncedBucketValidation);

  // Validate on blur (when user leaves the field) - immediate
  bucketNameInput.addEventListener('blur', function () {
    if (this.value.trim().length > 0) {
      updateBucketNameValidation();
    }
  });

  // Add real-time validation for principal ARN with debouncing
  const principalInput = document.getElementById('principal');

  // Debounced validation function (300ms delay)
  const debouncedPrincipalValidation = debounce(function () {
    if (principalInput.value.trim().length > 0) {
      updatePrincipalValidation();
    } else {
      principalInput.classList.remove('valid', 'invalid');
      document.getElementById('principalValidation').className = 'validation-message';
      document.getElementById('principalValidation').textContent = '';
    }
  }, 300);

  // Validate on input (as user types) - debounced
  principalInput.addEventListener('input', debouncedPrincipalValidation);

  // Validate on blur (when user leaves the field) - immediate
  principalInput.addEventListener('blur', function () {
    if (this.value.trim().length > 0) {
      updatePrincipalValidation();
    }
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', function (event) {
    // Ctrl/Cmd + S: Download policy
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      if (currentPolicy) {
        downloadPolicy();
        showNotification('Policy downloaded! (Ctrl/Cmd+S)', 'success');
      } else {
        showNotification('Generate a policy first before downloading (Ctrl/Cmd+S)', 'warning');
      }
    }

    // Ctrl/Cmd + V: Validate policy
    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
      event.preventDefault();
      if (currentPolicy) {
        validatePolicy();
      } else {
        showNotification('Generate a policy first before validating (Ctrl/Cmd+V)', 'warning');
      }
    }

    // Ctrl/Cmd + C: Copy policy (when not in input field)
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === 'c' &&
      !['INPUT', 'TEXTAREA'].includes(event.target.tagName)
    ) {
      if (currentPolicy) {
        copyPolicy();
      }
    }

    // Ctrl/Cmd + G: Generate policy
    if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
      event.preventDefault();
      generatePolicy();
    }

    // Ctrl/Cmd + K: Clear form
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      clearForm();
    }

    // Show keyboard shortcuts help with Ctrl/Cmd + /
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      showNotification(
        'Keyboard Shortcuts:\n' +
          '• Ctrl/Cmd + G: Generate Policy\n' +
          '• Ctrl/Cmd + S: Download Policy\n' +
          '• Ctrl/Cmd + C: Copy Policy\n' +
          '• Ctrl/Cmd + V: Validate Policy\n' +
          '• Ctrl/Cmd + K: Clear Form\n' +
          '• Ctrl/Cmd + /: Show This Help',
        'success'
      );
    }
  });
};
