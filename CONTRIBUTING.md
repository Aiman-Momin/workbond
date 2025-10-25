# Contributing to Adaptive Escrow Pro

Thank you for your interest in contributing to Adaptive Escrow Pro! We welcome contributions from the community and are grateful for your help in making this project better.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Rust 1.70+ (for smart contracts)
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/adaptive-escrow-pro.git
   cd adaptive-escrow-pro
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup Environment**
   ```bash
   cp env.example .env
   # Configure your .env file
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📋 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

### Suggesting Features

1. Check if the feature has already been suggested
2. Create a new issue with:
   - Clear title and description
   - Use case and motivation
   - Proposed solution
   - Additional context

### Code Contributions

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow our coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git commit -m "feat: add your feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎯 Development Guidelines

### Code Style

- **TypeScript**: Use strict mode and proper typing
- **React**: Use functional components with hooks
- **Styling**: Use TailwindCSS classes
- **Naming**: Use descriptive, camelCase names

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### Pull Request Process

1. **Title**: Use clear, descriptive title
2. **Description**: Explain what changes you made and why
3. **Tests**: Ensure all tests pass
4. **Documentation**: Update docs if needed
5. **Screenshots**: Include screenshots for UI changes

### Review Process

- All PRs require review from maintainers
- Address feedback promptly
- Keep PRs focused and small when possible
- Respond to comments and questions

## 🏗️ Project Structure

```
adaptive-escrow-pro/
├── contracts/          # Soroban smart contracts
├── backend/            # Node.js API server
├── frontend/           # Next.js React application
├── scripts/            # Development and deployment scripts
├── docs/              # Documentation
└── tests/             # Test files
```

## 🧪 Testing

### Running Tests

```bash
# All tests
npm run test

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Test Coverage

- Aim for >80% test coverage
- Write unit tests for new functions
- Write integration tests for API endpoints
- Write E2E tests for critical user flows

## 📚 Documentation

### Code Documentation

- Use JSDoc for functions and classes
- Add inline comments for complex logic
- Keep README files updated

### API Documentation

- Document all API endpoints
- Include request/response examples
- Update when adding new endpoints

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**
   - OS and version
   - Node.js version
   - Browser and version

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected behavior
   - Actual behavior

3. **Additional Context**
   - Screenshots or videos
   - Error messages
   - Related issues

## 💡 Feature Requests

When suggesting features, please include:

1. **Problem Statement**
   - What problem does this solve?
   - Who would benefit from this?

2. **Proposed Solution**
   - How should this work?
   - Any design considerations?

3. **Alternatives**
   - Other solutions you've considered
   - Why this approach is better

## 🤝 Community Guidelines

### Be Respectful

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Focus on what's best for the community

### Be Constructive

- Provide helpful feedback
- Suggest improvements
- Help others learn and grow

### Be Patient

- Remember that everyone is learning
- Be patient with questions
- Help newcomers get started

## 📞 Getting Help

- **Discord**: Join our community Discord
- **GitHub Issues**: For bugs and feature requests
- **Email**: support@adaptive-escrow.com
- **Documentation**: Check our comprehensive docs

## 🏆 Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Community highlights
- Special badges and recognition

## 📄 License

By contributing to Adaptive Escrow Pro, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Adaptive Escrow Pro! 🚀
