/**
 * Environment variable validation and access
 * Provides type-safe access to environment variables with helpful error messages
 */

interface EnvConfig {
  VITE_ALGOLIA_APP_ID: string;
  VITE_ALGOLIA_SEARCH_API_KEY: string;
  VITE_ALGOLIA_AGENT_ID: string;
}

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

function validateEnv(): EnvConfig {
  const requiredVars = [
    'VITE_ALGOLIA_APP_ID',
    'VITE_ALGOLIA_SEARCH_API_KEY',
    'VITE_ALGOLIA_AGENT_ID',
  ] as const;

  const missing: string[] = [];
  const empty: string[] = [];

  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (value === undefined) {
      missing.push(varName);
    } else if (value === '') {
      empty.push(varName);
    }
  }

  if (missing.length > 0 || empty.length > 0) {
    const errorMessages: string[] = ['Environment variable validation failed:'];

    if (missing.length > 0) {
      errorMessages.push(`\nMissing variables:\n  ${missing.join('\n  ')}`);
    }

    if (empty.length > 0) {
      errorMessages.push(`\nEmpty variables:\n  ${empty.join('\n  ')}`);
    }

    errorMessages.push('\nTo fix this:');
    errorMessages.push('1. Copy .env.example to .env');
    errorMessages.push('2. Fill in your Algolia credentials from https://dashboard.algolia.com/');
    errorMessages.push('3. Restart the development server');

    throw new EnvValidationError(errorMessages.join('\n'));
  }

  return {
    VITE_ALGOLIA_APP_ID: import.meta.env.VITE_ALGOLIA_APP_ID,
    VITE_ALGOLIA_SEARCH_API_KEY: import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY,
    VITE_ALGOLIA_AGENT_ID: import.meta.env.VITE_ALGOLIA_AGENT_ID,
  };
}

let _env: EnvConfig | null = null;

/**
 * Get validated environment variables
 * Throws EnvValidationError if required variables are missing
 */
export function getEnv(): EnvConfig {
  if (_env === null) {
    _env = validateEnv();
  }
  return _env;
}

/**
 * Vision analysis is now handled by server-side proxy at /api/vision
 * No client-side API key needed
 */
export function hasVisionSupport(): boolean {
  return true;
}

/**
 * Get environment variable with helpful error message
 */
export function getEnvVar(key: keyof EnvConfig): string {
  const env = getEnv();
  const value = env[key];
  if (!value) {
    throw new EnvValidationError(`Required environment variable ${key} is not set`);
  }
  return value;
}
