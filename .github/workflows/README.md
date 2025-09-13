# 🚀 GitHub Actions Workflows

This directory contains comprehensive GitHub Actions workflows for the Rock Paper Scissors Battle Royale project.

## 📋 Workflow Overview

### 🧪 CI (Continuous Integration) - `ci.yml`
**Triggers:** Push to main/develop, Pull Requests
**Purpose:** Comprehensive testing and validation

**Jobs:**
- **Frontend Testing**: JavaScript/TypeScript linting, formatting, and testing
- **Backend Testing**: Python code quality, linting, and unit tests
- **AI Training Tests**: AI module testing and validation
- **Structure Validation**: Project organization and cleanup verification
- **Security Scanning**: Basic security checks and vulnerability scanning
- **Performance Testing**: Basic performance benchmarks
- **Build & Package**: Create build artifacts

### 🚀 CD (Continuous Deployment) - `cd.yml`
**Triggers:** Push to main, Manual dispatch
**Purpose:** Automated deployment to different environments

**Jobs:**
- **Deploy to GitHub Pages**: Automatic frontend deployment
- **Deploy AI Training API**: Backend API deployment (if available)
- **Deploy to Staging**: Manual staging deployment
- **Deploy to Production**: Manual production deployment
- **Health Check**: Post-deployment verification

### 🔄 Phase Migration - `phase-migration.yml`
**Triggers:** Manual dispatch only
**Purpose:** Automated migration between development phases

**Migration Options:**
- **Phase 1 → TypeScript**: Convert JavaScript to TypeScript
- **Phase 1 → Rust**: Create Rust backend structure
- **Phase 1 → Python**: Enhance Python AI training
- **Phase 2 → Microservices**: Create microservices architecture
- **Full Migration**: Complete phase migration

### 🔒 Security & Quality - `security.yml`
**Triggers:** Push to main/develop, PRs, Weekly schedule, Manual
**Purpose:** Comprehensive security and quality assurance

**Jobs:**
- **Security Scan**: Python/JavaScript security scanning
- **Dependency Scan**: Vulnerability scanning for dependencies
- **Code Quality**: Linting, formatting, and quality analysis
- **License Check**: License compatibility verification
- **Container Security**: Docker security scanning (if applicable)

### ⚡ Performance Testing - `performance.yml`
**Triggers:** Push to main/develop, PRs, Weekly schedule, Manual
**Purpose:** Performance testing and monitoring

**Test Types:**
- **Frontend Performance**: Lighthouse testing and optimization
- **Backend Performance**: Python performance benchmarks
- **AI Training Performance**: AI algorithm performance testing
- **Memory Testing**: Memory usage and leak detection
- **Load Testing**: Concurrent request testing

### 🧹 Automated Cleanup - `cleanup.yml`
**Triggers:** Weekly schedule, Manual dispatch
**Purpose:** Automated maintenance and cleanup

**Cleanup Types:**
- **Debug Files**: Clean up debug and temporary files
- **Test Artifacts**: Remove old test files and coverage reports
- **Old Branches**: Identify and report old branches
- **Dependencies**: Check for outdated and unused packages
- **Cache**: Clear various caches

## 🎯 Workflow Features

### ✅ Quality Gates
- **Code Quality**: ESLint, Prettier, Black, Flake8, MyPy
- **Security**: Safety, Bandit, dependency scanning
- **Performance**: Lighthouse, memory profiling, load testing
- **Structure**: Project organization validation

### 🔧 Multi-Language Support
- **JavaScript/TypeScript**: Frontend testing and building
- **Python**: Backend and AI training testing
- **Rust**: Future backend migration support
- **Docker**: Container building and security

### 📊 Comprehensive Reporting
- **Test Coverage**: Code coverage reporting
- **Security Reports**: Vulnerability and security analysis
- **Performance Metrics**: Performance benchmarks and trends
- **Cleanup Reports**: Maintenance and cleanup summaries

### 🚀 Deployment Automation
- **GitHub Pages**: Automatic frontend deployment
- **Staging/Production**: Manual deployment with environment selection
- **Health Checks**: Post-deployment verification
- **Rollback Support**: Easy rollback capabilities

## 🛠️ Usage

### Manual Workflow Triggers
```bash
# Trigger specific workflows
gh workflow run ci.yml
gh workflow run cd.yml --ref main
gh workflow run phase-migration.yml --field phase=phase1-to-typescript
gh workflow run performance.yml --field test-type=all
gh workflow run cleanup.yml --field cleanup-type=all
```

### Environment Variables
- `NODE_VERSION`: Node.js version (default: 18)
- `PYTHON_VERSION`: Python version (default: 3.11)
- `RUST_VERSION`: Rust version (default: 1.70)

### Secrets Required
- `OPENAI_API_KEY`: For AI commentary features
- `GITHUB_TOKEN`: For GitHub API access
- `CODECOV_TOKEN`: For code coverage reporting

## 📈 Monitoring

### Workflow Status
- **CI**: Runs on every push and PR
- **CD**: Runs on main branch pushes
- **Security**: Weekly + on push/PR
- **Performance**: Weekly + on push/PR
- **Cleanup**: Weekly + manual

### Artifacts
- **Build Artifacts**: Frontend builds, Python packages
- **Test Reports**: Coverage, security, performance reports
- **Cleanup Reports**: Maintenance summaries

### Notifications
- **Success**: All checks passed
- **Failure**: Specific failure details
- **Security**: Vulnerability alerts
- **Performance**: Performance regression alerts

## 🔧 Customization

### Adding New Tests
1. Add test files to appropriate directories
2. Update workflow files to include new tests
3. Add new test jobs to CI workflow

### Modifying Deployment
1. Update CD workflow with new deployment targets
2. Add environment-specific configurations
3. Update health check endpoints

### Performance Thresholds
1. Modify performance thresholds in workflow files
2. Add new performance metrics
3. Update alert conditions

## 📚 Best Practices

### Workflow Design
- **Modular**: Separate concerns into different workflows
- **Efficient**: Use caching and parallel execution
- **Reliable**: Include proper error handling and retries
- **Secure**: Use secrets for sensitive data

### Testing Strategy
- **Fast Feedback**: Quick tests run first
- **Comprehensive**: Full test suite on main branch
- **Parallel**: Run independent tests in parallel
- **Cached**: Cache dependencies and build artifacts

### Deployment Strategy
- **Staged**: Deploy to staging before production
- **Rollback**: Easy rollback capabilities
- **Health Checks**: Verify deployment success
- **Monitoring**: Track deployment metrics

## 🚨 Troubleshooting

### Common Issues
1. **Dependency Failures**: Check requirements.txt and package.json
2. **Test Failures**: Review test logs and fix issues
3. **Deployment Failures**: Check environment configuration
4. **Performance Issues**: Review performance thresholds

### Debug Steps
1. Check workflow logs for specific errors
2. Verify environment variables and secrets
3. Test locally with same configurations
4. Review artifact outputs for details

### Support
- Check GitHub Actions documentation
- Review workflow logs for specific errors
- Test workflows locally when possible
- Update dependencies regularly
