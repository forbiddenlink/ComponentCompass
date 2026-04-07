import Langfuse from "langfuse";

let _langfuse: Langfuse | null = null;

export function getLangfuse(): Langfuse | null {
  if (!process.env.LANGFUSE_SECRET_KEY || !process.env.LANGFUSE_PUBLIC_KEY) {
    return null;
  }
  if (!_langfuse) {
    _langfuse = new Langfuse({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_BASEURL || "https://cloud.langfuse.com",
      flushAt: 20,
      flushInterval: 5000,
      environment: process.env.NODE_ENV,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
    });
  }
  return _langfuse;
}

/**
 * Wraps an AI generation with Langfuse tracing.
 * Usage:
 *   const result = await traceGeneration({
 *     name: 'my-feature',
 *     model: 'gpt-4o',
 *     input: messages,
 *     fn: async () => await openai.chat.completions.create(...)
 *   });
 */
export async function traceGeneration<T>({
  name,
  model,
  input,
  fn,
  metadata,
  userId,
  sessionId,
  tags,
}: {
  name: string;
  model: string;
  input: unknown;
  fn: () => Promise<T>;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  tags?: string[];
}): Promise<T> {
  const lf = getLangfuse();
  if (!lf) return fn();

  const trace = lf.trace({ name, userId, sessionId, tags });
  const generation = trace.generation({
    name,
    model,
    input,
    metadata,
  });

  try {
    const result = await fn();
    generation.end({ output: result });
    await lf.flushAsync();
    return result;
  } catch (error) {
    generation.end({ output: { error: String(error) }, level: "ERROR" });
    await lf.flushAsync();
    throw error;
  }
}
