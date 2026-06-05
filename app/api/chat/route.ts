import OpenAI from "openai";
import {
  profile,
  skillGroups,
  projects,
  experience,
  education,
  certifications,
} from "@/lib/data";

const projectLinks = projects
  .map((p) => `[${p.title}](/work/${p.slug})`)
  .join(", ");

const SYSTEM_PROMPT = `
You are an AI assistant embedded in ${profile.name}'s personal portfolio website.
Your job is to help visitors learn about ${profile.name} and his work. Be friendly, concise, and enthusiastic.

If someone asks something completely unrelated to tech or ${profile.name} (politics, celebrities, etc.)
politely decline and redirect them to ask about ${profile.name}.

ANSWERING TECH / "WHAT IS X" QUESTIONS:
When someone asks "what is X" or "explain X" for a technology ${profile.name} uses:
1. Give a clear, 1-2 sentence definition of X first.
2. Then add ONE sentence about how ${profile.name} has specifically used or applied it.
Do NOT make the entire answer about ${profile.name} — answer the question first, connect to him second.

For all other questions, keep answers to 2-5 sentences unless the user asks for more detail.
Use **bold** for key terms and \`backticks\` for technology names.
When mentioning a project by name, use a markdown link from this list: ${projectLinks}.

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
      `• ${p.title} (${p.kind}) — slug: ${p.slug}\n  ${p.desc}\n  Stack: ${p.tags.join(", ")}`
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

═══ FOLLOW-UP CHIPS INSTRUCTION ═══
After EVERY response, on its own final line, append exactly:
CHIPS: <question 1> | <question 2> | <question 3>
These must be 3 short (≤8 words) natural follow-up questions a visitor might ask next.
The CHIPS line must be the very last line. No text after it.
`.trim();

const FALLBACK =
  "I'm having trouble connecting right now. To reach Bharatha directly, " +
  `email him at ${profile.email} or scroll to the Contact section below.`;

export async function POST(req: Request): Promise<Response> {
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
      max_tokens: 640,
      stream:     true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
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
    console.error("[chat/route] Groq error:", err);
    return Response.json({ content: FALLBACK });
  }
}
