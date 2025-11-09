# Example S3 Bucket Policies

This directory contains common real-world examples of S3 bucket policies compatible with Impossible Cloud.

## Available Examples

### Basic Policies

- **[public-read.json](public-read.json)** - Public read access for static website hosting
- **[private-read-write.json](private-read-write.json)** - Private read/write access for authenticated users
- **[read-only.json](read-only.json)** - Read-only access to bucket contents

### Advanced Policies

- **[object-lock-versioning.json](object-lock-versioning.json)** - Object lock and versioning for compliance
- **[cors-enabled.json](cors-enabled.json)** - CORS configuration for cross-origin requests
- **[ip-restricted.json](ip-restricted.json)** - IP address-based access restrictions
- **[prefix-based-access.json](prefix-based-access.json)** - Different permissions for different prefixes/folders

### Use Case Specific

- **[cloudfront-oai.json](cloudfront-oai.json)** - CloudFront Origin Access Identity integration
- **[logging-bucket.json](logging-bucket.json)** - Logging bucket configuration
- **[encrypted-uploads-only.json](encrypted-uploads-only.json)** - Require encrypted uploads

## How to Use

1. Browse the examples to find one that matches your use case
2. Copy the policy JSON
3. Modify bucket names, ARNs, and other values to match your environment
4. Test the policy in a non-production environment first
5. Validate using the policy generator's validation feature
6. Apply to your Impossible Cloud bucket

## Security Notes

- **Always review** policies before applying them
- **Replace placeholder values** with your actual bucket names and ARNs
- **Test first** in a non-production environment
- **Follow least privilege** - grant only minimum required permissions
- **Add conditions** for additional security (IP restrictions, encryption requirements)

## Contributing

Have a useful example policy? Contributions are welcome! Please submit a pull request with:

- The policy JSON file
- A descriptive filename
- An entry in this README
- Comments explaining the use case

## Disclaimer

These examples are provided for reference only. Always:

- Review and understand policies before use
- Test in non-production environments
- Ensure compliance with your organization's security policies
- Consult with security professionals for sensitive use cases
