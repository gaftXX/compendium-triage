#!/bin/bash

# Setup Git hooks for development
echo "Setting up Git hooks..."

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Run linting
echo "Running ESLint..."
npm run lint

if [ $? -ne 0 ]; then
  echo "❌ ESLint failed. Please fix the issues before committing."
  exit 1
fi

# Run type checking
echo "Running TypeScript type checking..."
npm run type-check

if [ $? -ne 0 ]; then
  echo "❌ TypeScript type checking failed. Please fix the issues before committing."
  exit 1
fi

# Run formatting check
echo "Checking code formatting..."
npm run format:check

if [ $? -ne 0 ]; then
  echo "❌ Code formatting check failed. Please run 'npm run format' to fix formatting issues."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

# Create pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

# Run tests
echo "Running tests..."
npm test

if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Please fix the issues before pushing."
  exit 1
fi

echo "✅ Pre-push checks passed!"
EOF

# Make the hook executable
chmod +x .git/hooks/pre-push

echo "✅ Git hooks setup complete!"
echo "📋 Hooks installed:"
echo "   - pre-commit: Runs linting, type checking, and formatting checks"
echo "   - pre-push: Runs tests before pushing"
