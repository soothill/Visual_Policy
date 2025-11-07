/**
 * Smoke tests - Quick essential tests for CI
 * These tests verify core functionality works
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Impossible Cloud Bucket Policy Generator/);
  });

  test('can generate a basic policy', async ({ page }) => {
    await page.goto('/');

    // Fill in required fields
    await page.locator('#bucketName').fill('test-bucket');
    await page.locator('#action_s3_GetObject').check();

    // Generate policy
    await page.locator('.generate-btn').click();
    await page.waitForTimeout(500);

    // Verify policy was generated
    const policyOutput = page.locator('#policyOutput');
    const policyText = await policyOutput.textContent();

    expect(policyText).toContain('"Version": "2012-10-17"');
    expect(policyText).toContain('s3:GetObject');
    expect(policyText).toContain('test-bucket');
  });

  test('template loading works', async ({ page }) => {
    await page.goto('/');

    // Load a template
    await page.locator('text=Public Read Access').click();
    await page.waitForTimeout(300);

    // Verify action is selected
    const getObjectCheckbox = page.locator('#action_s3_GetObject');
    await expect(getObjectCheckbox).toBeChecked();
  });

  test('bucket name validation works', async ({ page }) => {
    await page.goto('/');

    // Enter valid bucket name
    const bucketInput = page.locator('#bucketName');
    await bucketInput.fill('my-valid-bucket');
    await bucketInput.blur();
    await page.waitForTimeout(500);

    // Check for success validation
    const validation = page.locator('#bucketNameValidation');
    await expect(validation).toContainText('Valid');
  });

  test('can validate generated policy', async ({ page }) => {
    await page.goto('/');

    // Generate a policy
    await page.locator('#bucketName').fill('test-bucket');
    await page.locator('#action_s3_GetObject').check();
    await page.locator('.generate-btn').click();
    await page.waitForTimeout(500);

    // Validate it
    await page.locator('.validate-btn').click();
    await page.waitForTimeout(500);

    // Check for success notification
    const notification = page.locator('#notification');
    await expect(notification).toBeVisible();
  });
});
