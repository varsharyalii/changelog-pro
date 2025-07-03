# Changelog

All notable changes to this project will be documented in this file.

## 0.16.0 (2025-07-04)

### Features

- **chat**: Real-time message notifications with sound alerts
- **ui**: Dark mode toggle with system preference detection
- **api**: GraphQL integration for better data fetching

### Fixes

- **auth**: Fixed token refresh causing infinite loop
- **mobile**: Resolved touch scroll issues on iOS devices

### Breaking Changes

- **config**: Renamed `apiEndpoint` to `baseUrl` in configuration
- **types**: Updated ChatMessage interface - `timestamp` now required

### Security

- **auth**: Implemented rate limiting for login attempts
- **xss**: Enhanced input sanitization for chat messages

### Improvements

- **performance**: Reduced bundle size by 40% with tree shaking
- **ux**: Smoother animations with reduced motion support

## 0.15.2 (2025-07-03)

### Fixes

- **deployment**: Fixed production build failing on missing env vars
- **types**: Corrected TypeScript declarations for Angular components

### Security

- **deps**: Updated vulnerable dependencies to latest versions

## 0.15.1 (2025-07-03)

### Breaking Changes

- test a random breaking change

## 0.14.0 (2025-07-02)

### Features

- enhance changelog sync system with smart content extraction
- implement template-based changelog description system

### Fixes

- **versioning:** update root package.json to 0.12.1 to match packages

### Thank You

- CI Bot
