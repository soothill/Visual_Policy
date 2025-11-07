/**
 * Test setup helper that loads policy-generator.js in a JSDOM environment
 * and makes the functions available for testing
 */

import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

export function setupTestEnvironment() {
  // Create minimal HTML structure that the script expects
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Test</title></head>
    <body>
      <div id="notification"></div>
      <input id="bucketName" type="text" />
      <div id="bucketNameValidation"></div>
      <input id="principal" type="text" />
      <div id="principalValidation"></div>
      <select id="policyEffect"><option value="Allow">Allow</option></select>
      <input id="resourcePath" type="text" />
      <textarea id="customActions"></textarea>
      <textarea id="condition"></textarea>
      <div id="policyOutput"></div>
    </body>
    </html>
  `;

  // Create JSDOM instance
  const dom = new JSDOM(html, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable'
  });

  const { window } = dom;

  // Set global variables
  global.window = window;
  global.document = window.document;
  global.navigator = window.navigator;

  // Load the policy-generator.js script
  const scriptContent = readFileSync('./policy-generator.js', 'utf-8');

  // Execute script in the context
  const scriptFn = new Function('window', 'document', scriptContent);
  scriptFn(window, window.document);

  // Return the window object with all functions
  return window;
}
