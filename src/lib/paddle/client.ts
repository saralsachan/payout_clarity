import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { getServerEnv } from "@/lib/env";

let paddleInstance: Paddle | null = null;

export function getPaddleClient(): Paddle {
  if (!paddleInstance) {
    const { paddleApiKey, paddleEnv } = getServerEnv();
    if (!paddleApiKey) throw new Error("PADDLE_API_KEY not configured");
    paddleInstance = new Paddle(paddleApiKey, {
      environment: paddleEnv === "production" ? Environment.production : Environment.sandbox,
    });
  }
  return paddleInstance;
}

export async function getCustomerPortalUrl(customerId: string): Promise<string | null> {
  try {
    const paddle = getPaddleClient();
    const session = await paddle.customerPortalSessions.create(customerId, []);
    return session.urls.general.overview;
  } catch {
    return null;
  }
}
