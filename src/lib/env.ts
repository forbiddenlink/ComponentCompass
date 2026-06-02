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

const ALGOLIA_VARS = [
  'VITE_ALGOLIA_APP_ID',
  'VITE_ALGOLIA_SEARCH_API_KEY',
  'VITE_ALGOLIA_AGENT_ID',
] as const;

/**
 * Whether all Algolia credentials are present and non-empty.
 *
 * Algolia powers ONLY the Chat tab. It is optional: the Screenshot Studio (Google key)
 * and Explore (static catalog JSON) views work without it, so we never throw on absence.
 */
export function hasAlgolia(): boolean {
  return ALGOLIA_VARS.every((varName) => {
    const value = import.meta.env[varName];
    return typeof value === 'string' && value !== '';
  });
}

/**
 * Read the validated Algolia config. Only call this once {@link hasAlgolia} is true
 * (e.g. from the lazily-loaded Chat surface). Throws if creds are missing so misuse
 * is caught loudly rather than producing a broken Algolia client.
 */
function validateEnv(): EnvConfig {
  if (!hasAlgolia()) {
    throw new EnvValidationError(
      'Algolia credentials are not configured. The Chat tab requires VITE_ALGOLIA_APP_ID, ' +
        'VITE_ALGOLIA_SEARCH_API_KEY, and VITE_ALGOLIA_AGENT_ID. ' +
        'Copy .env.example to .env and fill them in from https://dashboard.algolia.com/, ' +
        'then restart the dev server. (Studio and Explore work without these.)',
    );
  }

  return {
    VITE_ALGOLIA_APP_ID: import.meta.env.VITE_ALGOLIA_APP_ID,
    VITE_ALGOLIA_SEARCH_API_KEY: import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY,
    VITE_ALGOLIA_AGENT_ID: import.meta.env.VITE_ALGOLIA_AGENT_ID,
  };
}

let _env: EnvConfig | null = null;

/**
 * Get validated Algolia environment variables.
 * Throws EnvValidationError if Algolia creds are missing — gate calls behind {@link hasAlgolia}.
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
