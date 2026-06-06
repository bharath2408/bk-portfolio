import OpenAI from "openai";
import { profile, skillGroups, projects, experience, education } from "@/lib/data";

const SYSTEM_PROMPT = `
You are an AI assistant embedded in ${profile.name}'s retro terminal portfolio page.
You respond in terse, terminal-style plain text. No markdown, no bullet symbols (use plain dashes or dots), no headers.
Keep responses SHORT — 1-4 lines max unless the user explicitly asks for more.
If the user asks about ${profile.name} or his work, answer accurately using the context below.
If the user asks a general tech/dev question, answer concisely like a senior dev would in a CLI.
If completely off-topic, say: "outside my scope. try: help"

CONTEXT:
Name: ${profile.name}
Role: ${profile.role} | Location: ${profile.location}
About: ${profile.about}
Skills: ${skillGroups.map((g) => `${g.title}: ${g.items.join(", ")}`).join(" | ")}
Experience: ${experience.role} @ ${experience.company} (${experience.period}) — ${experience.summary}
Education: ${education.degree}, ${education.school} (${education.year}, CGPA ${education.cgpa})
Projects: ${projects.map((p) => `${p.title} — ${p.desc}`).join(" | ")}
Email: ${profile.email} | LinkedIn: ${profile.linkedin}
`.trim();

const FALLBACK = `ai: connection failed. check GROQ_API_KEY env var.`;

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return new Response(FALLBACK, { headers: { "Content-Type": "text/plain" } });

  const { query } = (await req.json()) as { query: string };

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  try {
    const stream = await client.chat.completions.create({
      model:      "llama-3.3-70b-versatile",
      max_tokens: 300,
      stream:     true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: query },
      ],
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[terminal/route] Groq error:", err);
    return new Response(FALLBACK, { headers: { "Content-Type": "text/plain" } });
  }
}
