const REGION = import.meta.env.VITE_RELEVANCE_REGION as string;
const AUTH_TOKEN = import.meta.env.VITE_RELEVANCE_AUTH_TOKEN as string;
const AGENT_ID = import.meta.env.VITE_WASTE_AGENT_ID as string;

const BASE_URL = `https://api-${REGION}.stack.tryrelevance.com/latest`;
const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 30000;

function extractAnswer(updates: unknown[]): string | null {
  for (const update of updates) {
    const u = update as Record<string, unknown>;
    const output = u.output as Record<string, unknown> | undefined;
    if (!output) continue;
    if (typeof output.answer === 'string') return output.answer;
    for (const val of Object.values(output)) {
      if (typeof val === 'string' && val.length > 0) return val;
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

      const pollData = await pollRes.json();
      const updates = (pollData.updates ?? []) as unknown[];

      const completed = updates.some((u) => {
        const upd = u as Record<string, unknown>;
        return upd.type === 'chain-success' || upd.status === 'complete' || upd.status === 'completed';
      });

      if (completed || updates.length > 0) {
        const answer = extractAnswer(updates);
        if (answer) return answer;
      }

      if (completed) break;
    }

    throw new Error('Waste Agent timed out after 30 seconds');
  } catch (err) {
    console.error('[WasteAgent]', err);
    throw err;
  }
}
