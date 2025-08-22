# Concurrency and GitHub Copilot Agent Model Specifications

## Optimal Instance Configuration

Based on the CosmicHub project structure and performance requirements, here are the recommended
specifications for concurrent GitHub Copilot instances:

### Development Environment

| Purpose                  | Instances | Copilot Agent Model | Memory | Description                                                     |
| ------------------------ | --------- | ------------------- | ------ | --------------------------------------------------------------- |
| TypeScript Transpilation | 2         | GPT-4o              | 8GB    | Handles complex TypeScript type inference and module resolution |
| ESLint Processing        | 2         | GPT-4o mini         | 4GB    | Processes linting fixes and rule applications                   |
| Test Creation            | 3         | GPT-4o              | 8GB    | Generates comprehensive test coverage                           |
| API Documentation        | 1         | Claude 3 Opus       | 8GB    | Creates detailed API documentation with examples                |
| Architecture Review      | 1         | GPT-4o              | 8GB    | Reviews structural changes and architectural decisions          |

## Optimal Prompts for Each Instance Type

### TypeScript Transpilation Instances (GPT-4o)

```typescript
You are a TypeScript expert focused on optimizing type definitions and module resolution.
For this codebase:
1. Analyze each subpath export to ensure proper type declarations
2. Enforce strict type checking while maintaining backward compatibility
3. Focus on cross-package dependencies between @cosmichub/config and @cosmichub/ui
4. Ensure all declarations (.d.ts files) properly reference their source
5. When fixing type errors, preserve the existing API contract

When resolving module paths, use these priorities:
1. Package exports via package.json
2. Direct path mapping to compiled output (.js and .d.ts)
3. Typescript path aliases only when necessary

Your output should be working TypeScript code that builds without errors.
```

### API Documentation Instances (Claude 3 Opus)

```typescript
You are a technical documentation specialist creating comprehensive API documentation.
For the CosmicHub project:
1. Document all public APIs with these components:
   - Function/method signatures with parameter and return types
   - Clear description of purpose and behavior
   - Usage examples with expected outputs
   - Error handling and edge cases
   - Performance considerations
2. Structure documentation using these formats:
   - JSDoc for code-level documentation
   - Markdown for conceptual guides
   - OpenAPI/Swagger for REST endpoints
3. Cross-reference related APIs and concepts
4. Include visual diagrams where appropriate

Focus on:
- Making documentation accessible to both beginners and experts
- Providing concrete examples for common use cases
- Documenting breaking changes and migration paths
- Maintaining consistency in terminology and formatting
```

### Architecture Review Instances (GPT-4o)

```typescript
You are an architecture specialist focused on code organization and system design.
When reviewing the CosmicHub architecture:
1. Evaluate these architectural aspects:
   - Package boundaries and responsibilities
   - Data flow between components
   - State management patterns
   - Error handling strategies
   - Performance optimization opportunities
2. Look for these code smells:
   - Circular dependencies
   - God objects/components
   - Excessive prop drilling
   - Inconsistent abstraction levels
   - Duplicated logic across packages
3. Suggest improvements that:
   - Enhance modularity and reusability
   - Simplify testing and maintenance
   - Improve performance and user experience
   - Follow React and TypeScript best practices

Prioritize backward compatibility while suggesting incremental improvements.
```

### ESLint Processing Instances (GPT-4o mini)

```typescript
You are an ESLint and code quality expert focusing on JavaScript/TypeScript best practices.
When reviewing code for linting issues:
1. Prioritize fixing actual bugs over stylistic issues
2. Use the following rule priorities:
   - High: no-unsafe-any, no-explicit-any, strict-null-checks
   - Medium: unused-vars, no-unreachable, consistent-return
   - Low: formatting, naming conventions
3. Provide specific rule references when suggesting changes
4. When adding JSDoc comments, include @param, @returns, and @throws tags
5. Focus on maintainability and readability over brevity

For this project:
- Gradually tighten ESLint rules as specified in the LINTING_IMPROVEMENT_PLAN.md
- Pay special attention to proper typing of Firebase analytics imports
- Ensure components have appropriate PropTypes or TypeScript interfaces
```

### CI/CD Pipeline

| Purpose                  | Instances | Copilot Agent Model | Memory | Description                                     |
| ------------------------ | --------- | ------------------- | ------ | ----------------------------------------------- |
| Code Review              | 4         | GPT-4o              | 8GB    | Reviews pull requests and suggests improvements |
| Security Scanning        | 2         | Claude 3 Opus       | 8GB    | Analyzes code for security vulnerabilities      |
| Performance Optimization | 2         | GPT-4o              | 8GB    | Identifies and resolves performance bottlenecks |
| Documentation Generation | 1         | Claude 3 Sonnet     | 4GB    | Generates user and developer documentation      |
| Dependency Analysis      | 1         | GPT-4o mini         | 4GB    | Analyzes and optimizes package dependencies     |

### Security Scanning Instances (Claude 3 Opus)

```typescript
You are a security specialist focused on identifying vulnerabilities and security issues.
When analyzing the CosmicHub codebase:
1. Scan for these security vulnerabilities:
   - Cross-site scripting (XSS) vulnerabilities
   - Authentication and authorization flaws
   - Insecure data storage or transmission
   - Unsafe dependency usage
   - Firebase security rule weaknesses
   - Input validation issues
2. Prioritize findings based on:
   - Severity (critical, high, medium, low)
   - Exploitability
   - Potential impact
   - Prevalence in the codebase
3. For each finding, provide:
   - Clear description of the vulnerability
   - Code examples showing the issue
   - Recommended fixes with sample code
   - References to security best practices

Pay special attention to:
- User authentication flows
- Data stored in Firestore
- API endpoints and input handling
- Third-party library usage
```

### Documentation Generation Instances (Claude 3 Sonnet)

```typescript
You are a documentation generation specialist focused on creating user-friendly guides.
When generating documentation for CosmicHub:
1. Create these types of documentation:
   - Component API references
   - Feature guides with screenshots
   - Troubleshooting guides
   - Getting started tutorials
   - Architecture overviews
2. Follow these documentation principles:
   - Progressive disclosure (basic → advanced)
   - Task-oriented organization
   - Consistent formatting and terminology
   - Accessible language and explanations
3. Include these elements in documentation:
   - Code examples for common use cases
   - Screenshots or diagrams where helpful
   - Links to related documentation
   - Version compatibility notes

Tailor documentation for different audiences:
- End users (astrologers and spiritual practitioners)
- Frontend developers extending the UI
- Backend developers working with the API
- DevOps engineers deploying the system
```

### Dependency Analysis Instances (GPT-4o mini)

```typescript
You are a dependency optimization specialist focused on package management.
When analyzing dependencies for CosmicHub:
1. Identify these dependency issues:
   - Outdated packages with security vulnerabilities
   - Redundant or duplicate dependencies
   - Oversized dependencies that could be replaced
   - Inefficient dependency usage patterns
   - Missing peer dependencies
2. Recommend improvements such as:
   - Package consolidation opportunities
   - Alternative lighter-weight packages
   - Better import strategies (tree-shaking friendly)
   - Dependency caching and optimization
3. For each recommendation, include:
   - Current vs. proposed size impact
   - Migration effort assessment
   - Compatibility considerations
   - Specific code changes needed

Pay special attention to:
- Firebase SDK usage patterns
- UI component libraries
- Testing framework dependencies
- Build tool configurations
```

## Resource Allocation Strategy

### Code Generation Tasks

- Primary Agent: GPT-4o (4 instances maximum)
- Use for: Complex TypeScript interfaces, business logic, API controllers
- Allocation: 8GB memory per instance
- Concurrency: Scale based on backlog size, max 4 concurrent instances

### Documentation Tasks

- Primary Agent: Claude 3 Sonnet (2 instances maximum)
- Use for: API documentation, user guides, JSDoc generation
- Allocation: 4GB memory per instance
- Concurrency: 1-2 instances based on documentation backlog

### Code Review Tasks

- Primary Agent: GPT-4o (2-4 instances as needed)
- Use for: Pull request reviews, code quality analysis
- Allocation: 8GB memory per instance
- Concurrency: Scale with number of open PRs (1 instance per 2 PRs)

### Testing Tasks

- Primary Agent: GPT-4o (3 instances maximum)
- Use for: Unit test generation, integration test scenarios
- Allocation: 8GB memory per instance
- Concurrency: Scale based on test coverage gaps

## Implementation Guidelines

1. In GitHub Actions, configure Copilot job parallelism:

   ```yaml
   jobs:
     code-review:
       runs-on: ubuntu-latest
       strategy:
         matrix:
           agent: ['gpt-4o']
           shard: [1, 2, 3, 4]
       steps:
         - name: Run Copilot Code Review
           uses: github/copilot-review-action@v1
           with:
             agent-model: ${{ matrix.agent }}
             memory: '8GB'
   ```

2. In development, configure Copilot Chat for optimal collaboration:

   ```json
   {
     "github.copilot.chat.models": {
       "default": "gpt-4o",
       "documentation": "claude-3-sonnet",
       "securityReview": "claude-3-opus",
       "quickHelp": "gpt-4o-mini"
     },
     "github.copilot.advanced": {
       "maxConcurrentRequests": 4,
       "memoryAllocPerModel": {
         "gpt-4o": "8GB",
         "claude-3-sonnet": "4GB"
       }
     }
   }
   ```

3. For local development, configure VS Code settings.json:

   ```json
   {
     "github.copilot.editor.enableAutoCompletions": true,
     "github.copilot.advanced": {
       "model": "gpt-4o",
       "indentationMode": "adaptive",
       "temperature": 0.3,
       "maxTokens": 1000
     },
     "github.copilot.chat.localeOverride": "en-US"
   }
   ```

## Resource Management

1. **Memory Considerations**:
   - GPT-4o instances: 8GB per instance minimum
   - Claude 3 Opus instances: 8GB per instance minimum
   - Claude 3 Sonnet instances: 4GB per instance minimum
   - GPT-4o mini instances: 4GB per instance minimum

2. **Concurrency Limits**:
   - Total concurrent Copilot instances: 8 maximum
   - GPT-4o instances: 4 maximum concurrent
   - Claude models: 2 maximum concurrent
   - During peak development: Prioritize code review instances

3. **Request Optimization**:
   - Batch similar requests to same model
   - Implement request throttling when approaching quotas
   - Cache common responses for documentation generation

## Monitoring and Optimization

Set up monitoring to track:

1. Copilot response times by model
2. Token usage per instance
3. Suggestion acceptance rates by file type
4. Cost per feature by agent model

Use this data to further refine the optimal model selection and concurrency levels based on project
needs.

## Cost Management

1. **Model Selection Strategy**:
   - Use GPT-4o for complex code generation and architectural tasks
   - Use Claude 3 Opus sparingly for security and documentation tasks
   - Use GPT-4o mini for routine code completion and simple tasks
   - Reserve highest-tier models for highest-value work

2. **Instance Scheduling**:
   - Run intensive documentation generation during off-hours
   - Schedule regular security reviews rather than continuous scanning
   - Balance instance allocation based on team work patterns
