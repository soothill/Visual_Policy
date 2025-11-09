# Contributing to Impossible Cloud Bucket Policy Generator

Thank you for your interest in contributing to the Impossible Cloud Bucket Policy Generator! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Visual_Policy.git
   cd Visual_Policy
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Install Playwright browsers** (for testing):
   ```bash
   npm run playwright:install
   ```

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes**: Fix issues in the codebase
- **New features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Code quality**: Refactoring, performance improvements

### Before You Start

- **Search existing issues** to see if your idea or bug has already been reported
- **Open an issue** to discuss major changes before investing significant time
- **Keep changes focused**: One feature or bug fix per pull request

## Development Workflow

### 1. Create a Branch

Create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Update documentation if needed

### 3. Test Your Changes

Run the test suite to ensure nothing is broken:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

Test manually by opening `index.html` in a browser:

```bash
# Using Python
python -m http.server 8000

# Then visit http://localhost:8000
```

### 4. Lint and Format

Ensure your code follows our style guidelines:

```bash
# Check linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Coding Standards

### JavaScript

- Use ES6+ features (const, let, arrow functions, template literals)
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Keep functions small and focused

### HTML/CSS

- Use semantic HTML5 elements
- Follow BEM methodology for CSS classes where applicable
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test responsive design on multiple screen sizes

### Commit Messages

Write clear, descriptive commit messages:

```
Add feature: Short description

Longer description if needed, explaining what and why
(not how - that's what the code is for)

Fixes #123
```

### File Organization

```
Visual_Policy/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── policy-generator.js # Main JavaScript
├── tests/              # Test files
│   ├── unit/           # Unit tests
│   └── e2e/            # End-to-end tests
├── .github/            # GitHub Actions workflows
└── docs/               # Documentation
```

## Testing

### Unit Tests

Unit tests are written using Jest:

```bash
npm run test:unit
```

Add tests for:

- Validation functions
- Policy generation logic
- Helper functions

### End-to-End Tests

E2E tests are written using Playwright:

```bash
npm run test:e2e
```

Add tests for:

- User workflows
- Template loading
- Policy generation
- Copy/download functionality

### Writing Tests

Example unit test:

```javascript
describe('validateBucketName', () => {
  it('should accept valid bucket names', () => {
    const result = validateBucketName('my-bucket-123');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject bucket names with uppercase letters', () => {
    const result = validateBucketName('MyBucket');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Bucket name cannot contain uppercase letters');
  });
});
```

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive

### Submitting

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Create a Pull Request** on GitHub
3. **Fill out the PR template** with:
   - Description of changes
   - Related issue number (if applicable)
   - Testing performed
   - Screenshots (for UI changes)

### Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

### After Merge

- Delete your branch (both local and remote)
- Pull the latest changes from main:
  ```bash
  git checkout main
  git pull upstream main
  ```

## Reporting Bugs

### Before Reporting

- Check if the bug has already been reported in [Issues](https://github.com/soothill/Visual_Policy/issues)
- Test with the latest version
- Gather relevant information (browser, OS, steps to reproduce)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '...'
3. Enter '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g., Windows 10, macOS 13]
- Browser: [e.g., Chrome 120, Firefox 121]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## Suggesting Enhancements

### Before Suggesting

- Check if the enhancement has already been suggested
- Consider if it fits the project's scope and goals

### Enhancement Suggestion Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other context, mockups, or examples.
```

## Questions?

Feel free to:

- Open an issue with your question
- Reach out to the maintainers
- Check the [README](README.md) for more information

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Impossible Cloud Bucket Policy Generator! 🎉
