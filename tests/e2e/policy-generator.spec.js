/**
 * End-to-End tests for the Impossible Cloud Bucket Policy Generator
 * Tests the full UI functionality and user workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Policy Generator - Page Load', () => {
  test('should load the page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Impossible Cloud Bucket Policy Generator/);
    await expect(page.locator('h1')).toContainText('Impossible Cloud Bucket Policy Generator');
  });

  test('should display all form elements', async ({ page }) => {
    await page.goto('/');

    // Check for key form elements
    await expect(page.locator('#bucketName')).toBeVisible();
    await expect(page.locator('#policyEffect')).toBeVisible();
    await expect(page.locator('#resourcePath')).toBeVisible();
    await expect(page.locator('#customActions')).toBeVisible();
    await expect(page.locator('#condition')).toBeVisible();
    await expect(page.locator('.generate-btn')).toBeVisible();
  });

  test('should display action categories', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Object Operations')).toBeVisible();
    await expect(page.locator('text=Bucket Operations')).toBeVisible();
    await expect(page.locator('text=Bucket Policy & CORS')).toBeVisible();
    await expect(page.locator('text=Object Versioning')).toBeVisible();
  });

  test('should display template buttons', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Public Read Access')).toBeVisible();
    await expect(page.locator('text=Private Read/Write')).toBeVisible();
    await expect(page.locator('text=Cross-Account Access')).toBeVisible();
    await expect(page.locator('text=Object Lock & Versioning')).toBeVisible();
  });
});

test.describe('Policy Generator - Bucket Name Validation', () => {
  test('should validate valid bucket name', async ({ page }) => {
    await page.goto('/');

    const bucketInput = page.locator('#bucketName');
    await bucketInput.fill('my-valid-bucket-123');
    await bucketInput.blur();

    // Wait for validation to complete
    await page.waitForTimeout(500);

    const validation = page.locator('#bucketNameValidation');
    await expect(validation).toContainText('Valid bucket name');
  });

  test('should reject bucket name with uppercase letters', async ({ page }) => {
    await page.goto('/');

    const bucketInput = page.locator('#bucketName');
    await bucketInput.fill('MyBucket');
    await bucketInput.blur();

    await page.waitForTimeout(500);

    const validation = page.locator('#bucketNameValidation');
    await expect(validation).toContainText('uppercase');
  });

  test('should reject bucket name with underscores', async ({ page }) => {
    await page.goto('/');

    const bucketInput = page.locator('#bucketName');
    await bucketInput.fill('my_bucket');
    await bucketInput.blur();

    await page.waitForTimeout(500);

    const validation = page.locator('#bucketNameValidation');
    await expect(validation).toContainText('underscores');
  });

  test('should reject bucket name that is too short', async ({ page }) => {
    await page.goto('/');

    const bucketInput = page.locator('#bucketName');
    await bucketInput.fill('ab');
    await bucketInput.blur();

    await page.waitForTimeout(500);

    const validation = page.locator('#bucketNameValidation');
    await expect(validation).toContainText('at least 3 characters');
  });
});

test.describe('Policy Generator - Category Toggle', () => {
  test('should toggle action categories', async ({ page }) => {
    await page.goto('/');

    // Find a collapsed category
    const bucketOpsHeader = page.locator(
      '.action-category:has-text("Bucket Operations") .category-header'
    );
    const bucketOpsCategory = page.locator('.action-category:has-text("Bucket Operations")');

    // Should be collapsed initially
    await expect(bucketOpsCategory).toHaveClass(/collapsed/);

    // Click to expand
    await bucketOpsHeader.click();
    await page.waitForTimeout(300);

    // Should be expanded now
    await expect(bucketOpsCategory).not.toHaveClass(/collapsed/);

    // Click again to collapse
    await bucketOpsHeader.click();
    await page.waitForTimeout(300);

    // Should be collapsed again
    await expect(bucketOpsCategory).toHaveClass(/collapsed/);
  });
});

test.describe('Policy Generator - Template Loading', () => {
  test('should load Public Read Access template', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Public Read Access').click();

    // Check that GetObject is selected
    const getObjectCheckbox = page.locator('#action_s3_GetObject');
    await expect(getObjectCheckbox).toBeChecked();

    // Check that effect is set to Allow
    const effectSelect = page.locator('#policyEffect');
    await expect(effectSelect).toHaveValue('Allow');
  });

  test('should load Private Read/Write template', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Private Read/Write').click();

    // Check that multiple actions are selected
    await expect(page.locator('#action_s3_GetObject')).toBeChecked();
    await expect(page.locator('#action_s3_PutObject')).toBeChecked();
    await expect(page.locator('#action_s3_DeleteObject')).toBeChecked();
    await expect(page.locator('#action_s3_ListBucket')).toBeChecked();
  });

  test('should load Object Lock & Versioning template', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Object Lock & Versioning').click();

    // Check that object lock actions are selected
    await expect(page.locator('#action_s3_GetObjectLockConfiguration')).toBeChecked();
    await expect(page.locator('#action_s3_PutObjectLockConfiguration')).toBeChecked();
    await expect(page.locator('#action_s3_BypassGovernanceRetention')).toBeChecked();

    // Check that versioning actions are selected
    await expect(page.locator('#action_s3_GetBucketVersioning')).toBeChecked();
    await expect(page.locator('#action_s3_PutBucketVersioning')).toBeChecked();
  });
});

test.describe('Policy Generator - Policy Generation', () => {
  test('should generate a basic policy', async ({ page }) => {
    await page.goto('/');

    // Fill in bucket name
    await page.locator('#bucketName').fill('test-bucket');

    // Select an action
    await page.locator('#action_s3_GetObject').check();

    // Generate policy
    await page.locator('.generate-btn').click();

    // Wait for generation
    await page.waitForTimeout(500);

    // Check policy output
    const policyOutput = page.locator('#policyOutput');
    const policyText = await policyOutput.textContent();

    expect(policyText).toContain('"Version": "2012-10-17"');
    expect(policyText).toContain('"Statement"');
    expect(policyText).toContain('"Effect": "Allow"');
    expect(policyText).toContain('s3:GetObject');
    expect(policyText).toContain('test-bucket');
  });

  test('should show error when generating without bucket name', async ({ page }) => {
    await page.goto('/');

    // Select an action
    await page.locator('#action_s3_GetObject').check();

    // Try to generate without bucket name
    await page.locator('.generate-btn').click();

    // Wait for notification
    await page.waitForTimeout(500);

    // Check for error notification
    const notification = page.locator('#notification');
    await expect(notification).toBeVisible();
    await expect(notification).toContainText('bucket name');
  });

  test('should show error when generating without actions', async ({ page }) => {
    await page.goto('/');

    // Fill in bucket name only
    await page.locator('#bucketName').fill('test-bucket');

    // Try to generate without selecting actions
    await page.locator('.generate-btn').click();

    // Wait for notification
    await page.waitForTimeout(500);

    // Check for error notification
    const notification = page.locator('#notification');
    await expect(notification).toBeVisible();
    await expect(notification).toContainText('action');
  });

  test('should generate policy with multiple actions', async ({ page }) => {
    await page.goto('/');

    // Fill in bucket name
    await page.locator('#bucketName').fill('multi-action-bucket');

    // Select multiple actions
    await page.locator('#action_s3_GetObject').check();
    await page.locator('#action_s3_PutObject').check();
    await page.locator('#action_s3_DeleteObject').check();

    // Generate policy
    await page.locator('.generate-btn').click();

    await page.waitForTimeout(500);

    // Check policy output
    const policyOutput = page.locator('#policyOutput');
    const policyText = await policyOutput.textContent();

    expect(policyText).toContain('s3:GetObject');
    expect(policyText).toContain('s3:PutObject');
    expect(policyText).toContain('s3:DeleteObject');
  });

  test('should generate policy with custom resource path', async ({ page }) => {
    await page.goto('/');

    await page.locator('#bucketName').fill('test-bucket');
    await page.locator('#resourcePath').fill('documents/*');
    await page.locator('#action_s3_GetObject').check();

    await page.locator('.generate-btn').click();

    await page.waitForTimeout(500);

    const policyOutput = page.locator('#policyOutput');
    const policyText = await policyOutput.textContent();

    expect(policyText).toContain('documents/*');
  });
});

test.describe('Policy Generator - Policy Validation', () => {
  test('should validate a valid policy', async ({ page }) => {
    await page.goto('/');

    // Generate a valid policy first
    await page.locator('#bucketName').fill('test-bucket');
    await page.locator('#action_s3_GetObject').check();
    await page.locator('.generate-btn').click();

    await page.waitForTimeout(500);

    // Validate the policy
    await page.locator('.validate-btn').click();

    await page.waitForTimeout(500);

    // Check for success notification
    const notification = page.locator('#notification');
    await expect(notification).toBeVisible();
    await expect(notification).toContainText('valid');
  });

  test('should detect invalid JSON', async ({ page }) => {
    await page.goto('/');

    // Set invalid JSON
    const policyOutput = page.locator('#policyOutput');
    await policyOutput.fill('{ invalid json }');

    // Validate
    await page.locator('.validate-btn').click();

    await page.waitForTimeout(500);

    // Check for error notification
    const notification = page.locator('#notification');
    await expect(notification).toBeVisible();
    await expect(notification).toContainText('Invalid JSON');
  });
});

test.describe('Policy Generator - Copy and Download', () => {
  test('should copy policy to clipboard', async ({ page, context }) => {
    await page.goto('/');

    // Generate a policy
    await page.locator('#bucketName').fill('test-bucket');
    await page.locator('#action_s3_GetObject').check();
    await page.locator('.generate-btn').click();

    await page.waitForTimeout(500);

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Copy policy
    await page.locator('.copy-btn').click();

    await page.waitForTimeout(500);

    // Check notification
    const notification = page.locator('#notification');
    await expect(notification).toContainText('copied');
  });

  test('should download policy as JSON', async ({ page }) => {
    await page.goto('/');

    // Generate a policy
    await page.locator('#bucketName').fill('download-test-bucket');
    await page.locator('#action_s3_GetObject').check();
    await page.locator('.generate-btn').click();

    await page.waitForTimeout(500);

    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    await page.locator('.download-btn').click();

    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toContain('download-test-bucket-policy.json');
  });
});

test.describe('Policy Generator - Clear Form', () => {
  test('should clear form when confirmed', async ({ page }) => {
    await page.goto('/');

    // Fill in some data
    await page.locator('#bucketName').fill('test-bucket');
    await page.locator('#action_s3_GetObject').check();
    await page.locator('#resourcePath').fill('test/*');

    // Set up dialog handler
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('clear');
      await dialog.accept();
    });

    // Click clear button
    await page.locator('.clear-btn').click();

    await page.waitForTimeout(500);

    // Verify form is cleared
    await expect(page.locator('#bucketName')).toHaveValue('');
    await expect(page.locator('#action_s3_GetObject')).not.toBeChecked();
    await expect(page.locator('#resourcePath')).toHaveValue('');
  });

  test('should not clear form when cancelled', async ({ page }) => {
    await page.goto('/');

    // Fill in some data
    await page.locator('#bucketName').fill('test-bucket');

    // Set up dialog handler to cancel
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    // Click clear button
    await page.locator('.clear-btn').click();

    await page.waitForTimeout(500);

    // Verify form is not cleared
    await expect(page.locator('#bucketName')).toHaveValue('test-bucket');
  });
});

test.describe('Policy Generator - Effect Selection', () => {
  test('should generate policy with Allow effect', async ({ page }) => {
    await page.goto('/');

    await page.locator('#bucketName').fill('test-bucket');
    await page.locator('#policyEffect').selectOption('Allow');
    await page.locator('#action_s3_GetObject').check();

    await page.locator('.generate-btn').click();

    await page.waitForTimeout(500);

    const policyText = await page.locator('#policyOutput').textContent();
    expect(policyText).toContain('"Effect": "Allow"');
  });

  test('should generate policy with Deny effect', async ({ page }) => {
    await page.goto('/');

    await page.locator('#bucketName').fill('test-bucket');
    await page.locator('#policyEffect').selectOption('Deny');
    await page.locator('#action_s3_GetObject').check();

    await page.locator('.generate-btn').click();

    await page.waitForTimeout(500);

    const policyText = await page.locator('#policyOutput').textContent();
    expect(policyText).toContain('"Effect": "Deny"');
  });
});

test.describe('Policy Generator - Custom Actions', () => {
  test('should include custom actions in policy', async ({ page }) => {
    await page.goto('/');

    await page.locator('#bucketName').fill('test-bucket');
    await page.locator('#action_s3_GetObject').check();
    await page.locator('#customActions').fill('s3:GetBucketLocation\ns3:PutObjectAcl');

    await page.locator('.generate-btn').click();

    await page.waitForTimeout(500);

    const policyText = await page.locator('#policyOutput').textContent();
    expect(policyText).toContain('s3:GetObject');
    expect(policyText).toContain('s3:GetBucketLocation');
    expect(policyText).toContain('s3:PutObjectAcl');
  });
});
