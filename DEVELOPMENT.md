# Development Guide

This guide covers the complete development setup for the Compendium Triage application.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open note system independently
npm run dev:note-system
```

## 📋 Available Scripts

### Development
- `npm run dev` - Start both renderer and main process
- `npm run dev:renderer` - Start Vite dev server only
- `npm run dev:main` - Start Electron main process only
- `npm run dev:note-system` - Start independent note system

### Building
- `npm run build` - Build entire application
- `npm run build:renderer` - Build renderer only
- `npm run build:main` - Build main process only
- `npm run start` - Start built application
- `npm run preview` - Preview built renderer

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Utilities
- `npm run clean` - Clean build directories
- `npm run setup-hooks` - Setup Git hooks

## 🔧 Development Tools

### Code Formatting & Linting
- **ESLint**: JavaScript/TypeScript linting with React rules
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Type checking and IntelliSense

### Testing
- **Jest**: Test runner with TypeScript support
- **Testing Library**: React component testing utilities
- **Coverage**: Code coverage reporting

### Git Hooks
- **pre-commit**: Runs linting, type checking, and formatting
- **pre-push**: Runs tests before pushing

## 🏗️ Project Structure

```
compendium-triage/
├── renderer/           # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # Business logic
│   │   └── types/      # TypeScript types
│   ├── index.html      # Main app entry
│   └── noteSystem.html # Independent note system
├── main/               # Electron main process
├── cross/              # Cross component system
├── ui/                 # Shared UI components
├── orchestrator/       # AI orchestrator (future)
└── docs/               # Documentation
```

## 🧪 Testing

### Writing Tests
```typescript
// Example test file
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Building

### Development Build
```bash
npm run build
```

### Production Build
```bash
NODE_ENV=production npm run build
```

## 🔍 Debugging

### VS Code Debugging
1. Install recommended extensions
2. Use F5 to start debugging
3. Set breakpoints in TypeScript/React code

### Browser DevTools
- Available in development mode
- Access via F12 or right-click → Inspect

## 🚨 Troubleshooting

### Common Issues

#### ESLint Errors
```bash
npm run lint:fix
```

#### TypeScript Errors
```bash
npm run type-check
```

#### Build Issues
```bash
npm run clean
npm run build
```

#### Test Failures
```bash
npm test -- --verbose
```

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Commit with descriptive messages
6. Push and create a pull request

### Commit Message Format
```
type(scope): description

feat(notes): add entity search functionality
fix(ui): resolve layout issue in office list
docs(readme): update development guide
```
