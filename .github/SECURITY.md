# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| `0.1.x` (`@velkin/ui`, `@velkin/react`, `@velkin/vue`, `@velkin/mcp`) | Yes |
| Pre-release / untagged commits | Best effort |

Commercial Pro packages (`@velkin/ui-pro`, `@velkin/react-pro`) are distributed separately — report Pro issues via the same channels below if they affect published npm packages.

## Reporting a vulnerability

**Do not open a public GitHub issue for an undisclosed security bug.**

1. Prefer [GitHub Private Vulnerability Reporting](https://github.com/BhavinPatel5/velkin/security/advisories/new) (Security Advisories).
2. Or email [security@velkinui.com](mailto:security@velkinui.com) with:
   - Affected package and version
   - Reproduction steps or PoC
   - Impact assessment (confidentiality / integrity / availability)
   - Whether the issue is already public elsewhere

We aim to acknowledge within **3 business days** and share a remediation plan when confirmed.

## Scope

In scope for this repository:

- MIT component source under `packages/ui`, `packages/react`, `packages/vue`, `packages/mcp`, `create-velkin-app`
- Supply-chain issues in the published lockfile / CI workflows
- Secret leakage in this public tree

Out of scope:

- Private monorepo / Pro-only source not shipped here
- Social engineering or physical attacks
- DoS against velkinui.com infrastructure (report critical site issues to the same email)

## Public hardening

This repository enables:

- Dependabot alerts + security updates
- Secret scanning + push protection
- CodeQL analysis (Actions)
- Dependency review on pull requests
- Branch protection on `main` (required CI)
