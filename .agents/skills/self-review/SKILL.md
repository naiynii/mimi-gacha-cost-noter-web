---
name: self-review
description: Instructs the agent to perform a rigorous self-review of newly implemented code, acting as a strict code reviewer. The agent will analyze the code for bugs, edge cases, performance issues, and maintainability, and then fix any issues found.
---

# Self-Review Skill

This skill enforces a "subagent" persona where the agent steps back from the implementation role and acts purely as a strict, senior code reviewer.

## When to Use This Skill

Use this skill immediately after implementing a new feature, fixing a bug, or making significant code changes. The user may prompt you with "do a self review" or "review your code." 
If the user's global instructions say so, you may also invoke this skill automatically before concluding a coding task.

## The Review Process

When this skill is activated, you must follow these steps:

### Step 1: The Reviewer Persona
Adopt the persona of a highly critical Senior Engineer reviewing a Junior Developer's Pull Request. Do not be lenient just because you wrote the code.

### Step 2: Code Analysis
Examine the exact diffs and new files you just wrote. Look specifically for:
1. **Logic Errors & Edge Cases**: Are there unhandled null values, off-by-one errors, or unexpected inputs that break the code?
2. **Security Vulnerabilities**: Are inputs properly sanitized? Are there exposed secrets?
3. **Performance**: Are there unnecessary loops, memory leaks, or inefficient queries?
4. **Maintainability & Style**: Is the code easy to read? Are variables well-named? Are there magic numbers? Does it follow the project's existing style?
5. **Testing**: Is the code testable? Does it need new tests?

### Step 3: Document Findings
Create an artifact or write out a checklist of the issues found. If the code is completely flawless (which is rare), explain *why* it is flawless.

### Step 4: The Fixer Persona
Revert to the Implementer persona. Go through the checklist of issues found during the review and fix them using your editing tools.

### Step 5: Final Verification
Verify that the fixes actually resolve the identified issues without breaking other parts of the system. 
