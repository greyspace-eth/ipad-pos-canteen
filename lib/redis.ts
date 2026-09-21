import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function queuePrintJob(job: Record<string, unknown>) {
  await redis.lpush('print-jobs', JSON.stringify({ ...job, at: new Date().toISOString() }));
}
