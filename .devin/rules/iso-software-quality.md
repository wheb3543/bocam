---
trigger: manual
description: Enforce ISO/IEC 25010 software quality characteristics including maintainability, portability, and functional suitability
---
# ISO/IEC 25010 Software Quality Standards

# 1. Functional Suitability & Correctness
- Ensure all implemented features fully and accurately satisfy the functional requirements without missing edge cases.
- Validate that user workflows are intuitive, complete, and achieve the intended outcome effectively.

# 2. Maintainability & Modularity
- Code must be highly analyzable and easy to modify; components must be loosely coupled and highly cohesive.
- Ensure high testability: structure functions and modules in a way that makes them easy to isolate and test.

# 3. Portability & Compatibility
- Ensure the codebase does not rely on hardcoded environment configurations, making it easy to deploy across different environments (Development, Staging, Production).
- Avoid device-specific or browser-specific API usage unless polyfills or fallbacks are explicitly provided.

# 4. Performance Efficiency (ISO Compliance)
- Optimize resource utilization (CPU, memory, and network usage) under normal and peak load conditions.
- Ensure response times and throughput meet high-performance user experience benchmarks.
