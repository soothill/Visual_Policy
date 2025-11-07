# Test Suite Documentation

This document describes the comprehensive test suite for the Impossible Cloud Bucket Policy Generator.

## Overview

The test suite consists of two types of tests:

1. **Unit Tests** - Test individual JavaScript functions in isolation
2. **End-to-End Tests** - Test the full application workflow in a browser

## Running Tests

### Prerequisites

First, install all dependencies:

```bash
npm install
```

Install Playwright browsers (only needed for E2E tests):

```bash
npm run playwright:install
```

### Run All Tests

```bash
npm test
```

This will run both unit tests and end-to-end tests.

### Run Unit Tests Only

```bash
npm run test:unit
```

### Run End-to-End Tests Only

```bash
npm run test:e2e
```

### Run Tests in Watch Mode (Unit Tests)

```bash
npm run test:unit:watch
```

### Run E2E Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Run E2E Tests in Debug Mode

```bash
npm run test:e2e:debug
```

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

## Test Structure

```
tests/
├── unit/
│   ├── validation.test.js      # Tests for bucket name and ARN validation
│   └── test-setup.js            # Test environment setup helper
└── e2e/
    └── policy-generator.spec.js # End-to-end UI tests
```

## Unit Tests

### Bucket Name Validation Tests

Tests the `validateBucketName()` function with various scenarios:

- ✅ Valid bucket names (lowercase, numbers, dots, hyphens)
- ❌ Invalid length (too short or too long)
- ❌ Invalid characters (uppercase, underscores, special chars)
- ❌ Invalid format (IP addresses, xn-- prefix, -s3alias suffix)
- ❌ Invalid patterns (adjacent periods, period-hyphen combinations)

### Principal ARN Validation Tests

Tests the `validatePrincipalARN()` function:

- ✅ Valid wildcards, AWS ARNs, Impossible Cloud ARNs
- ✅ Service principals and canonical user IDs
- ❌ Invalid ARN formats
- ❌ Invalid account IDs
- ❌ Invalid resource formats

## End-to-End Tests

### Page Load Tests

- Page loads successfully with correct title
- All form elements are visible
- Action categories are displayed
- Template buttons are present

### Bucket Name Validation Tests

- Valid bucket names are accepted
- Invalid bucket names show appropriate errors
- Real-time validation works correctly

### Category Toggle Tests

- Action categories can be expanded and collapsed
- UI updates correctly on toggle

### Template Loading Tests

- Public Read Access template loads correctly
- Private Read/Write template loads correctly
- Object Lock & Versioning template loads correctly
- Templates select appropriate actions

### Policy Generation Tests

- Basic policy generation works
- Errors shown for missing required fields
- Multiple actions included in policy
- Custom resource paths work
- Custom actions are included

### Policy Validation Tests

- Valid policies pass validation
- Invalid JSON is detected
- Validation errors are displayed

### Copy and Download Tests

- Policy can be copied to clipboard
- Policy can be downloaded as JSON file
- Filename includes bucket name

### Form Management Tests

- Clear form works with confirmation
- Cancel clear form preserves data
- Effect selection (Allow/Deny) works

### Custom Actions Tests

- Custom actions can be added
- Custom actions appear in generated policy

## GitHub Actions Integration

Tests run automatically on:

1. **Every push to any branch** - via `.github/workflows/test.yml`
2. **Every pull request** - via `.github/workflows/test.yml`
3. **Before deployment** - via `.github/workflows/deploy.yml`

The deployment will only proceed if all tests pass.

## Test Browsers

E2E tests run on multiple browsers:

- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

In CI, only Chromium is used for faster execution.

## Continuous Integration

The GitHub Actions workflow:

1. Installs Node.js 20
2. Installs npm dependencies
3. Installs Playwright browsers
4. Runs unit tests
5. Runs end-to-end tests
6. Uploads test results and reports as artifacts

If any test fails, the workflow fails and deployment is prevented.

## Coverage Requirements

The test suite aims for:

- **70% line coverage**
- **70% branch coverage**
- **70% function coverage**
- **70% statement coverage**

Coverage reports are generated in the `coverage/` directory.

## Adding New Tests

### Adding Unit Tests

1. Open `tests/unit/validation.test.js`
2. Add new test cases in the appropriate `describe` block
3. Use the existing pattern:

```javascript
test('should test something', () => {
  const result = functionToTest(input);
  expect(result.isValid).toBe(true);
  expect(result.errors).toHaveLength(0);
});
```

### Adding E2E Tests

1. Open `tests/e2e/policy-generator.spec.js`
2. Add new test cases in the appropriate `test.describe` block
3. Use Playwright's API:

```javascript
test('should do something', async ({ page }) => {
  await page.goto('/');
  await page.locator('#elementId').click();
  await expect(page.locator('#result')).toBeVisible();
});
```

## Debugging Failed Tests

### Unit Tests

Run tests in watch mode and examine the output:

```bash
npm run test:unit:watch
```

### E2E Tests

Run tests in headed mode to see what's happening:

```bash
npm run test:e2e:headed
```

Or use debug mode to step through tests:

```bash
npm run test:e2e:debug
```

### CI Failures

1. Check the GitHub Actions logs
2. Download the test artifacts (Playwright reports, screenshots)
3. Review the HTML report locally

## Test Maintenance

- Update tests when adding new features
- Keep test descriptions clear and descriptive
- Maintain test independence (tests shouldn't depend on each other)
- Use appropriate timeouts for async operations
- Clean up test data after each test

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
