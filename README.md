# Impossible Cloud Bucket Policy Generator

A simple, user-friendly web-based utility for creating S3 bucket policies for Impossible Cloud. Perfect for new Impossible Cloud customers who need to quickly generate secure and compliant bucket policies. All S3 actions are compatible with Impossible Cloud's S3 API, and the tool also supports AWS S3 for cross-platform compatibility.

## Features

- **Quick Templates**: Pre-configured templates for common use cases:
  - Public Read Access
  - Private Read/Write Access
  - CloudFront Origin Access
  - Cross-Account Access

- **Visual Interface**: Easy-to-use GUI with no command-line experience required

- **Flexible Configuration**:
  - **Real-time bucket name validation** - Ensures compliance with AWS S3 naming standards
  - **Progressive ARN suggestions** - Step-by-step guidance while typing ARNs, not just error messages
  - **Impossible Cloud compatible S3 actions** - 33+ S3 actions organized in 8 collapsible categories, all compatible with Impossible Cloud
  - Specify bucket name and resource paths
  - Choose Allow/Deny effects
  - Configure principals (IAM users, accounts, or public access)
  - Add custom actions via textarea for anything not listed
  - Optional IAM conditions support

- **Policy Management**:
  - Live JSON preview
  - **Manual editing** - Click directly in the policy output to edit the JSON
  - Copy to clipboard
  - Download as JSON file
  - **Strict JSON validation** - Comprehensive validation of policy structure, AWS compliance, and best practices
  - Clear form functionality

## Live Demo

This application can be deployed to GitHub Pages for easy access. See the [Deployment](#deployment) section below.

## Getting Started

### Option 1: Open Directly in Browser

Simply open `index.html` in any modern web browser:

```bash
# Using your default browser
open index.html

# Or on Linux
xdg-open index.html

# Or on Windows
start index.html
```

### Option 2: Serve with a Local Web Server

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Then navigate to http://localhost:8000 in your browser
```

## Usage Guide

### Basic Usage

1. **Choose a Template** (optional): Click one of the quick template buttons to load pre-configured settings
2. **Enter Bucket Name**: Specify your S3 bucket name (required)
3. **Configure Policy**:
   - Select Effect (Allow/Deny)
   - Enter Principal (AWS user/account or * for public)
   - Check desired actions (GetObject, PutObject, etc.)
   - Specify resource path within the bucket
4. **Generate Policy**: Click the "Generate Policy" button
5. **Edit if Needed**: Click directly in the policy output to manually edit the JSON
6. **Copy or Download**: Use the action buttons to copy or download your policy

### Manual Editing

After generating a policy, you can click directly in the policy output area to manually edit the JSON. This is useful for:
- Fine-tuning specific values
- Adding advanced conditions
- Making quick adjustments without regenerating
- Learning by experimenting with the policy structure

**Tips:**
- Click the "Validate JSON" button after editing to ensure your JSON is valid
- Use proper JSON formatting (quotes, commas, brackets)
- The Copy and Download buttons will use your edited version

### Examples

#### Public Read Access for Static Website

1. Click "Public Read Access" template
2. Change bucket name to your bucket
3. Click "Generate Policy"
4. Copy the generated policy to your S3 bucket policy settings

#### Private Access for Specific IAM User

1. Click "Private Read/Write" template
2. Update bucket name
3. Update principal with your IAM user ARN: `arn:aws:iam::123456789012:user/YourUsername`
4. Click "Generate Policy"

#### CloudFront Distribution Access

1. Click "CloudFront Access" template
2. Update bucket name
3. Replace `YOUR-OAI-ID` with your CloudFront Origin Access Identity ID
4. Click "Generate Policy"

### Bucket Name Validation

The application validates bucket names in real-time as you type, ensuring they comply with AWS S3 naming standards. The validation checks:

**AWS S3 Bucket Naming Rules:**
- ✓ Length between 3 and 63 characters
- ✓ Only lowercase letters, numbers, dots (.), and hyphens (-)
- ✓ Must begin and end with a letter or number
- ✓ Cannot be formatted as an IP address (e.g., 192.168.1.1)
- ✓ Cannot start with `xn--` prefix
- ✓ Cannot end with `-s3alias` suffix
- ✓ Cannot contain two adjacent periods (..)
- ✓ Cannot have a period adjacent to a hyphen (.- or -.)
- ✓ Cannot contain uppercase letters
- ✓ Cannot contain underscores (_)

**Visual Feedback:**
- 🟢 Green border = Valid bucket name
- 🔴 Red border = Invalid bucket name
- Specific error messages shown below the input field

**Examples:**
- ✅ Valid: `my-bucket-name`, `example.bucket.123`, `prod-data-2024`
- ❌ Invalid: `MyBucket` (uppercase), `my_bucket` (underscore), `my..bucket` (adjacent periods)

### Principal ARN Validation

The application provides **progressive, helpful suggestions** as you type ARNs, guiding you through each field step-by-step rather than just showing errors. This makes it easy to construct valid ARNs even if you're unfamiliar with the format.

**Supported Principal Formats:**

1. **Wildcard (Public Access)**
   - `*` - Grants public access (shows security warning)

2. **AWS IAM User/Role ARNs**
   - Format: `arn:aws:iam::123456789012:user/username`
   - Format: `arn:aws:iam::123456789012:role/rolename`
   - Format: `arn:aws:iam::123456789012:root` (entire account)

3. **Impossible Cloud IAM ARNs**
   - Format: `arn:ipcld:iam::YourCanonicalID:user/username`
   - Format: `arn:ipcld:iam::YourCanonicalID:policy/policyname`

4. **Canonical User IDs**
   - Format: 64-character hexadecimal string
   - Example: `79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be`
   - Used by Impossible Cloud and S3-compatible services

5. **Service Principals**
   - Format: `s3.amazonaws.com`
   - Format: `cloudfront.amazonaws.com`
   - ⚠ Note: AWS service principals may not be supported by Impossible Cloud

6. **Account IDs**
   - Format: `123456789012` (12 digits)

**Validation Rules:**
- ✓ AWS ARN format: `arn:partition:service:region:account-id:resource`
- ✓ Impossible Cloud ARN format: `arn:ipcld:iam::CanonicalID:resource`
- ✓ Valid AWS partitions: `aws`, `aws-cn`, `aws-us-gov`
- ✓ AWS account ID must be exactly 12 digits
- ✓ IAM ARNs require resource type (user, role, group, or root)
- ✓ Impossible Cloud ARNs require canonical ID and resource (user/name or policy/name)
- ✓ Service principals must end with `.amazonaws.com` or `.amazon.com`
- ✓ Canonical user IDs must be 64-character hexadecimal strings
- ⚠ Warns about AWS-specific services (ec2, lambda, cloudfront, etc.) not supported by Impossible Cloud

**Progressive Suggestions:**

As you type, the system guides you through each part of the ARN:

**For AWS ARNs:**
1. **Starting out**: "💡 Start typing: `*` for public, `arn:aws:iam::` for AWS IAM, `arn:ipcld:iam::` for Impossible Cloud..."
2. **After `arn:`**: "💡 Next: partition → `arn:aws:` for AWS, `arn:ipcld:` for Impossible Cloud"
3. **After `arn:aws:`**: "💡 Next: service → `iam`, `s3`, or `sts` then `:`"
4. **After `arn:aws:iam::`**: "💡 Next: 12-digit account ID → `123456789012` then `:`"
5. **While typing account**: "💡 Account ID: 5/12 digits (7 more needed)"
6. **After account ID**: "💡 Perfect! Now add `:` and resource (e.g., `user/username` or `root`)"
7. **After `:`**: "💡 Next: resource → `user/username`, `role/rolename`, or `root`"
8. **Complete**: "✓ Valid IAM user ARN"

**For Impossible Cloud ARNs:**
1. **After `arn:ipcld:`**: "💡 Next: service → `iam` (Impossible Cloud only supports IAM currently)"
2. **After `arn:ipcld:iam::`**: "💡 Next: Your Impossible Cloud canonical ID then `:`"
3. **While typing canonical ID**: "💡 Continue entering canonical ID, then add `:` for resource"
4. **After canonical ID**: "💡 Next: resource → `user/username` or `policy/policyname`"
5. **Complete**: "✓ Valid Impossible Cloud user ARN"

**Visual Feedback:**
- 🔵 Blue hint box = Helpful suggestion for next step
- 🟢 Green border = Valid ARN format
- 🔴 Red border = Invalid ARN format
- 🟠 Orange warning = Valid but with warnings (e.g., public access, unusual service)
- Progress tracking for account IDs (e.g., "5/12 digits")

**Examples:**

Valid ARNs:
```
*
arn:aws:iam::123456789012:user/alice
arn:aws:iam::123456789012:role/S3AccessRole
arn:aws:iam::123456789012:root
arn:ipcld:iam::abc123def456:user/bob
arn:ipcld:iam::xyz789ghi012:policy/my-policy
79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be (canonical ID)
s3.amazonaws.com (⚠ warning: may not work with Impossible Cloud)
123456789012
```

Invalid ARNs:
```
arn:aws:iam::12345:user/alice                ✗ (account ID must be 12 digits)
arn:aws:iam::123456789012:alice              ✗ (missing resource type)
arn:invalid:iam::123456789012:user/bob       ✗ (invalid partition)
arn:ipcld:s3::canonical123:bucket/mybucket   ✗ (Impossible Cloud only supports IAM service)
arn:ipcld:iam::canonical123:alice            ✗ (missing resource type)
service.example.com                          ✗ (must end with .amazonaws.com)
```

**Security and Compatibility Warnings:**
- Using `*` triggers a warning about public access
- AWS service principals (*.amazonaws.com) trigger warning about Impossible Cloud compatibility
- AWS-specific services (ec2, lambda, cloudfront, etc.) trigger warnings
- Just using an account ID suggests using full ARN format

### S3 Actions Selection (Impossible Cloud Compatible)

The application provides **33+ S3 actions** organized into 8 categories for easy selection. All actions are compatible with Impossible Cloud's S3 API. Click any category header to expand/collapse it.

**Action Categories:**

1. **📄 Object Operations** (7 actions)
   - GetObject, PutObject, DeleteObject, GetObjectAttributes, GetObjectTagging, PutObjectTagging, DeleteObjectTagging

2. **🗂️ Bucket Operations** (6 actions)
   - ListBucket, ListBucketVersions, ListBucketMultipartUploads, GetBucketLocation, GetBucketVersioning, PutBucketVersioning

3. **🔐 Bucket Policy & CORS** (6 actions)
   - GetBucketPolicy, PutBucketPolicy, DeleteBucketPolicy, GetBucketCORS, PutBucketCORS, DeleteBucketCORS

4. **🔄 Object Versioning** (6 actions)
   - GetObjectVersion, DeleteObjectVersion, GetObjectVersionAttributes, GetObjectVersionTagging, PutObjectVersionTagging, DeleteObjectVersionTagging

5. **📤 Multipart Upload** (2 actions)
   - AbortMultipartUpload, ListMultipartUploadParts

6. **🏷️ Bucket Tagging** (3 actions)
   - GetBucketTagging, PutBucketTagging, DeleteBucketTagging

7. **🔒 Object Lock & Compliance** (3 actions)
   - GetObjectLockConfiguration, PutObjectLockConfiguration, BypassGovernanceRetention

8. **🚀 Advanced** (1 action)
   - s3:* (all S3 actions)

**Usage Tips:**
- Object Operations category is expanded by default for quick access to common actions
- Other categories start collapsed to keep the interface clean
- All actions are compatible with Impossible Cloud's S3 API
- Select `s3:*` in the Advanced category to grant all S3 permissions
- Use the "Additional Actions" textarea for any actions not in the list

### Advanced Features

#### Adding Custom Actions

In the "Additional Actions" textarea, enter one action per line:
```
s3:GetBucketLocation
s3:PutObjectAcl
s3:GetObjectVersion
```

#### Using Conditions

Add IAM policy conditions in the "Condition" field using JSON format:
```json
{
  "StringLike": {
    "s3:prefix": ["documents/*"]
  }
}
```

Or IP address restrictions:
```json
{
  "IpAddress": {
    "aws:SourceIp": "203.0.113.0/24"
  }
}
```

### Policy Validation

The built-in validator performs comprehensive checks to ensure your policy is valid and follows AWS best practices. Click the "✓ Validate JSON" button to check your policy.

**What the Validator Checks:**

**Errors (must be fixed):**
- ✓ Valid JSON syntax
- ✓ Required fields: `Version` and `Statement`
- ✓ Version must be "2012-10-17" or "2008-10-17"
- ✓ Statement must be a non-empty array
- ✓ Each statement must have `Effect` (Allow/Deny)
- ✓ Each statement must have `Principal` or `NotPrincipal`
- ✓ Each statement must have `Action` or `NotAction`
- ✓ Each statement must have `Resource` or `NotResource`
- ✓ Effect must be exactly "Allow" or "Deny"
- ✓ Principal format validation (ARN structure)
- ✓ Action format validation (service:action)
- ✓ Resource ARN format (must start with `arn:aws:s3:::`)
- ✓ Bucket name length and format
- ✓ Condition operators must be valid IAM operators
- ✓ No duplicate Principal/NotPrincipal, Action/NotAction, or Resource/NotResource
- ✓ Sid must be alphanumeric only
- ✓ Account IDs must be 12 digits

**Warnings (best practices):**
- ⚠️ Using deprecated Version "2008-10-17"
- ⚠️ Wildcard (*) principal grants public access
- ⚠️ Non-S3 actions in S3 bucket policy
- ⚠️ Unknown S3 actions
- ⚠️ Service principals should end with .amazonaws.com
- ⚠️ Unknown or custom fields in policy

**Example Validation Output:**

```
✅ Policy is valid and follows AWS best practices!
```

Or with warnings:
```
⚠️ Policy is valid but has warnings:
• Principal: Using wildcard (*) grants public access - ensure this is intentional
• Version "2008-10-17" is deprecated. Use "2012-10-17"
```

## Common S3 Actions

- `s3:GetObject` - Read/download objects
- `s3:PutObject` - Upload/write objects
- `s3:DeleteObject` - Delete objects
- `s3:ListBucket` - List bucket contents
- `s3:GetBucketLocation` - Get bucket region
- `s3:PutObjectAcl` - Modify object ACLs

## Security Best Practices

⚠️ **Important Security Notes:**

- **Avoid Public Access**: Only use `*` as principal when you specifically need public access
- **Least Privilege**: Grant only the minimum permissions required
- **Use Conditions**: Add conditions to restrict access by IP, time, or other factors
- **Regular Review**: Periodically review and update your bucket policies
- **Enable Encryption**: Consider adding conditions that require encrypted uploads
- **Block Public Access**: Use S3 Block Public Access settings alongside policies

## Applying the Generated Policy

1. Log in to AWS Console
2. Navigate to S3 service
3. Select your bucket
4. Go to "Permissions" tab
5. Click "Bucket Policy"
6. Paste your generated policy
7. Click "Save changes"

Alternatively, use AWS CLI:
```bash
aws s3api put-bucket-policy --bucket YOUR-BUCKET-NAME --policy file://bucket-policy.json
```

## Deployment

### GitHub Pages (Recommended)

This repository includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

#### Automatic Deployment (using GitHub Actions)

1. **Enable GitHub Pages:**
   - Go to your repository settings on GitHub
   - Navigate to "Pages" in the left sidebar
   - Under "Build and deployment", select "GitHub Actions" as the source

2. **Merge to main branch:**
   - Merge your changes to the `main` or `master` branch
   - The GitHub Actions workflow will automatically deploy

3. **Access your site:**
   - Your site will be available at: `https://YOUR-USERNAME.github.io/Visual_Policy/`
   - The URL will be shown in the GitHub Pages settings

#### Manual GitHub Pages Setup

If you prefer manual deployment:

1. Go to repository Settings → Pages
2. Under "Source", select "Deploy from a branch"
3. Choose the branch containing your files (e.g., `main`)
4. Select the root folder (`/`)
5. Click "Save"

Your site will be live at `https://YOUR-USERNAME.github.io/Visual_Policy/` within a few minutes.

### Other Hosting Options

Since this is a static site (single HTML file), you can deploy it to:

- **Netlify**: Drag and drop the `index.html` file
- **Vercel**: Import from GitHub repository
- **AWS S3 + CloudFront**: Upload as a static website
- **Any web server**: Just upload `index.html`

## Browser Compatibility

Works with all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Contributing

This is a simple single-file application. To modify:

1. Edit `index.html` - contains HTML, CSS, and JavaScript
2. Test in your browser
3. Submit improvements via pull request

## License

This project is open source and available for free use.

## Support

For issues or questions:
- Review the [AWS S3 Policy Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html)
- Check the [AWS Policy Generator](https://awspolicygen.s3.amazonaws.com/policygen.html)

## Changelog

### Version 1.0.0
- Initial release
- Quick templates for common scenarios
- Visual policy builder
- Copy, download, and validate functionality
- Responsive design
