const REGION = import.meta.env.VITE_RELEVANCE_REGION as string;
const AUTH_TOKEN = import.meta.env.VITE_RELEVANCE_AUTH_TOKEN as string;
const AGENT_ID = import.meta.env.VITE_WASTE_AGENT_ID as string;

const BASE_URL = `https://api-${REGION}.stack.tryrelevance.com/latest`;
const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 30000;

type AnyObj = Record<string, unknown>;

function extractAnswer(response: AnyObj): string | null {
  const updates = response.updates as AnyObj[] | undefined;
  const u0 = updates?.[0] as AnyObj | undefined;
  const out = u0?.output as AnyObj | undefined;
  const outOut = out?.output as AnyObj | undefined;

  const candidates: unknown[] = [
    outOut?.answer,
    out?.answer,
    outOut?.content,
    out?.content,
    u0?.content,
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c.trim();
  }

  const history = outOut?.history_items as unknown;
  if (Array.isArray(history) && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const item = history[i] as AnyObj;
      if (item?.role === 'ai' && typeof item.message === 'string' && item.message.trim().length > 0) {
        return (item.message as string).trim();
      }
    }
  }

  return null;
}

export async function askWasteAgent(message: string): Promise<string> {
  try {
    const triggerRes = await fetch(`${BASE_URL}/agents/trigger`, {
      method: 'POST',
      headers: {
        Authorization: AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: { role: 'user', content: message },
        agent_id: AGENT_ID,
      }),
    });

    if (!triggerRes.ok) {
      throw new Error(`Trigger failed: ${triggerRes.status}`);
    }

    const triggerData = await triggerRes.json();
    const { studio_id, job_id } = triggerData.job_info as { studio_id: string; job_id: string };

    const pollUrl = `${BASE_URL}/studios/${studio_id}/async_poll/${job_id}?ending_update_only=true`;
    const headers = { Authorization: AUTH_TOKEN };

    const deadline = Date.now() + TIMEOUT_MS;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const pollRes = await fetch(pollUrl, { headers });
      if (!pollRes.ok) continue;

      const response = await pollRes.json() as AnyObj;

      if (response.type === 'complete') {
        console.log('Relevance AI response:', response);
        const answer = extractAnswer(response);
        if (answer) return answer;
        console.warn('Could not extract answer from Relevance AI response:', response);
        return "I got your message but had trouble reading my reply. Try again?";
      }
    }

    throw new Error('Waste Agent timed out after 30 seconds');
  } catch (err) {
    console.error('[WasteAgent]', err);
    throw err;
  }
}