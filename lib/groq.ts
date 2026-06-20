"use client";

export interface GroqMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BuddyContext {
  studentName?: string;
  currentStep?: string;
  currentUnit?: string;
  currentCourse?: string;
  lastBotText?: string;
  screen?: "chat" | "onboarding" | "home" | "passport" | "profile";
}

export async function askGroqWithHistory(
  history: GroqMessage[],
  context: BuddyContext
): Promise<string> {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  const contextLines = [
    `You are TAP Buddy 🐝, a warm, sharp learning guide for students aged 8–16.`,
    `Student name: ${context.studentName || "champ"}.`,
    context.currentCourse ? `They are studying: ${context.currentCourse}.` : "",
    context.currentUnit ? `Current unit: ${context.currentUnit}.` : "",
    context.screen ? `They are on the ${context.screen} screen.` : "",
    context.lastBotText
      ? `The last thing shown to them in the lesson was: "${context.lastBotText}".`
      : "",
    ``,
    `Rules:`,
    `- Keep replies to 2–3 short sentences max. Be direct, warm, never preachy.`,
    `- If they're stuck on something from the lesson, guide them with a question or hint — don't just give the answer.`,
    `- If they ask something off-topic, gently steer back to the lesson.`,
    `- Use emojis sparingly (max 1 per reply). Match energy: excited = match it, confused = calm them.`,
    `- Never say "As an AI" or refer to yourself as a model.`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!key) {
    const last = history[history.length - 1];
    return `Hey ${context.studentName || "champ"}! Ask me anything about ${context.currentUnit || "what you're learning"} 🐝`;
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 120,
        temperature: 0.65,
        messages: [
          { role: "system", content: contextLines },
          ...history,
        ],
      }),
    });

    const data = await res.json();
    return (
      data?.choices?.[0]?.message?.content?.trim() ||
      "You're doing great, keep going! 🌟"
    );
  } catch {
    return `You've got this ${context.studentName || "champ"}! 💪`;
  }
}

export async function askGroq(
  userMessage: string,
  studentName?: string
): Promise<string> {
  return askGroqWithHistory(
    [{ role: "user", content: userMessage }],
    { studentName }
  );
}