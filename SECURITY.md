# Security Policy

> **Implementation status:** For the current authentication and authorization behavior, use [the Authentication and RBAC reference](./docs/AUTHENTICATION_RBAC.md). This policy contains project guidance and must not be read as proof that every listed security feature is implemented.

> **Licensing status:** For the current licensing and runtime-protection behavior, use [the licensing runtime reference](./docs/licensing/LICENSE_RUNTIME_REFERENCE.md). The code currently supports local validation, feature gates, heartbeat, and central requests; it does not establish a universal Kill Switch, legal license classification, or regulatory compliance by itself.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.0   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

### How to Report

1. **Email**: Send an email to security@sgh-portal.com
2. **Subject**: Use the prefix `[SECURITY]` in your email subject
3. **Details**: Include as much detail as possible about the vulnerability

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if available)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Investigation**: Within 7 business days
- **Resolution**: Based on severity and complexity

### Security Best Practices

#### For Developers

- Never commit secrets or API keys to the repository
- Use environment variables for sensitive data
- Keep dependencies updated
- Follow the principle of least privilege
- Implement proper input validation and sanitization
- Use HTTPS for all communications
- Implement rate limiting on public endpoints
- Regular security audits and penetration testing

#### For Users

- Use strong, unique passwords
- Enable two-factor authentication when available
- Keep your software updated
- Be cautious of phishing attempts
- Report suspicious activity immediately

## Security Features

### Implemented or source-backed

- **Authentication**: OAuth 2.0 with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: TLS/SSL for data in transit
- **Input Validation**: Zod schemas for type-safe validation
- **Rate Limiting**: Express rate limiting middleware
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Prevention**: Drizzle ORM with parameterized queries
- **XSS Protection**: Content Security Policy (CSP)
- **Licensing validation**: RSA-PSS/SHA-256 signature validation, Hardware ID, expiry, domain, and feature checks; see the licensing runtime reference

### Not established by this policy

- [ ] Two-factor authentication (2FA) - not verified as a general user feature
- [ ] Universal licensing Kill Switch or guaranteed shutdown on invalid licenses
- [ ] HIPAA/GDPR or other regulatory compliance certification
- [ ] Security audit logging
- [ ] Automated security scanning in CI/CD
- [ ] Dependency vulnerability scanning
- [ ] Session timeout configuration
- [ ] IP whitelisting for admin access

## Dependency Management

### Regular Updates

- Dependencies are updated regularly
- Security patches are applied immediately
- Automated dependency scanning is planned

### Vulnerability Scanning

- Use `npm audit` to check for vulnerabilities
- Review security advisories regularly
- Monitor Common Vulnerabilities and Exposures (CVE)

## Incident Response

### Severity Levels

- **Critical**: Immediate action required (within 24 hours)
- **High**: Action required within 48 hours
- **Medium**: Action required within 7 days
- **Low**: Action required in next release cycle

### Incident Response Plan

1. **Identification**: Detect and confirm the incident
2. **Containment**: Limit the impact of the incident
3. **Eradication**: Remove the threat
4. **Recovery**: Restore normal operations
5. **Lessons Learned**: Document and improve processes

## Legal and Compliance

This project follows:

- GDPR (General Data Protection Regulation)
- HIPAA (Health Insurance Portability and Accountability Act) where applicable
- Local data protection laws

## Contact

For security-related inquiries:
- **Email**: security@sgh-portal.com
- **GitHub Security**: Use GitHub's private vulnerability reporting feature
