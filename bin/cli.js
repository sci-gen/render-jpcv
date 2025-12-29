#!/usr/bin/env node

// Thin JS wrapper so the published package can run via npx without depending on TS at runtime.
// The actual implementation is compiled to ../lib/cli.js
require('../lib/cli');
