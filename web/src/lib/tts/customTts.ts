export type SynthesizeOptions = {
  apiBase?: string; // e.g., http://127.0.0.1:8000
  lang?: string; // e.g., en, it
  speakerFile?: File | null;
  timeoutMs?: number;
};

export async function synthesizeTTS(text: string, opts: SynthesizeOptions = {}): Promise<string> {
  const envBase = (process.env.NEXT_PUBLIC_TTS_BASE as string | undefined)?.trim();
  const base = opts.apiBase || envBase || "http://127.0.0.1:8000";
  const form = new FormData();
  form.append("text", text);
  form.append("lang", opts.lang || "en");
  if (opts.speakerFile) form.append("speaker", opts.speakerFile);

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30000);
  try {
    const res = await fetch(`${base}/synthesize`, { 
      method: "POST", 
      body: form, 
      signal: controller.signal,
      // Explicitly set mode to cors
      mode: 'cors',
      credentials: 'include'
    });
    
    if (!res.ok) {
      // Try to get error details from response
      try {
        const errorData = await res.json();
        if (errorData?.error) {
          throw new Error(`TTS server error: ${errorData.error}`);
        }
      } catch (jsonError) {
        // If we can't parse the error JSON, use the status
        throw new Error(`XTTS synth failed: HTTP ${res.status}`);
      }
      throw new Error(`XTTS synth failed: HTTP ${res.status}`);
    }
    
    const json = await res.json();
    if (!json?.file) throw new Error("XTTS synth returned no file");
    return json.file as string; // relative to Next.js public
  } catch (e: any) {
    console.error("TTS synthesis error:", e);
    const hint = `Failed to reach TTS backend at ${base}. Is it running? Try opening ${base}/docs`;
    throw new Error(`${e?.message || e} — ${hint}`);
  } finally {
    clearTimeout(t);
  }
}
