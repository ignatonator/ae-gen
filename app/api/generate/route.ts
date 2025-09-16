import { NextRequest } from "next/server";
import OpenAI from "openai";
import { buildPrompt } from "@/lib/prompt";

export async function POST(req: NextRequest) {
  try {
    const { date, gospelRef, sigla: siglaBody, passageText } = await req.json();
    const sigla = (siglaBody || gospelRef) as string | undefined;

    if (!date || !sigla) {
      return new Response(JSON.stringify({ error: "Brak daty lub sigli biblijnych" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openai = new OpenAI({ apiKey });

  const prompt = buildPrompt({ date, gospelRef: sigla, passageText });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return new Response(JSON.stringify({ error: "Empty response from model" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}