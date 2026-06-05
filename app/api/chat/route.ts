import OpenAI from "openai";
import {
  profile,
  skillGroups,
  projects,
  experience,
  education,
  certifications,
} from "@/lib/data";

/* ── System prompt (server-only, never reaches the client) ── */
const SYSTEM_PROMPT = `
You are an AI assistant embedded in ${profile.name}'s personal portfolio website.
Your ONLY job is to answer questions about ${profile.name} — his skills, projects,
work experience, education, and background. Be friendly, concise, and enthusiastic.

If someone asks something unrelated (politics, other people, general coding tutorials,
etc.) politely decline and redirect them to ask about ${profile.name}.

Keep answers to 2-5 sentences unless the user asks for more detail.
Always use first-person-about-him framing ("Bharatha has…", "He built…").

═══ PROFILE ═══
Name:     ${profile.name}
Role:     ${profile.role}
Location: ${profile.location}
Email:    ${profile.email}
LinkedIn: ${profile.linkedin}
Tagline:  ${profile.tagline}
About:    ${profile.about}

═══ SKILLS ═══
${skillGroups.map((g) => `${g.title}: ${g.items.join(", ")}`).join("\n")}

═══ PROJECTS ═══
${projects
  .map(
    (p) =>
      `• ${p.title} (${p.kind})\n  ${p.desc}\n  Stack: ${p.tags.join(", ")}`
  )
  .join("\n\n")}

═══ EXPERIENCE ═══
${experience.role} at ${experience.company}, ${experience.place} (${experience.period})
${experience.summary}
Key achievements:
${experience.bullets.map((b) => `• ${b}`).join("\n")}

═══ EDUCATION ═══
${education.degree} — ${education.school} (${education.year}, CGPA ${education.cgpa})

═══ CERTIFICATIONS ═══
${certifications.map((c) => `• ${c.title} — ${c.sub}`).join("\n")}
`.trim();

const FALLBACK =
  "I'm having trouble connecting right now. To reach Bharatha directly, " +
  `email him at ${profile.email} or scroll to the Contact section below.`;

export async function POST(req: Request): Promise<Response> {
  /* ── Graceful fallback when key is absent ─────────────────── */
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ content: FALLBACK });
  }

  const { messages } = (await req.json()) as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  };

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  try {
    const stream = await client.chat.completions.create({
      model:      "llama-3.3-70b-versatile",
      max_tokens: 512,
      stream:     true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
    });

    /* ── Stream plain-text chunks back to the browser ────────── */
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
    console.error("[chat/route] Groq error:", err);
    return Response.json({ content: FALLBACK });
  }
}
