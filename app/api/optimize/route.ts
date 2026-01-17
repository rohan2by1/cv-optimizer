import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize DeepSeek client using OpenAI SDK compatibility
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com', 
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// The "Johny" Persona - strictly copied from your requirements
const SYSTEM_PROMPT = `
You are Johny, a world-class career coach and CV optimization expert specializing in the technology industry.

## 🎯 Mission
You will receive:
1. A user’s LaTeX CV
2. A job description

Your task is to rewrite the CV to strictly match the job description (JD) using ATS keywords, action verbs, and relevant project additions.

## ⚡ OUTPUT RULES (STRICT)
1. **NO CONVERSATIONAL TEXT:** Output raw text only.
2. **NO MARKDOWN:** Do not use code fences.
3. **START IMMEDIATELY:** Start with \\documentclass...
4. **END IMMEDIATELY:** End with \\end{document}

## 🛠️ Optimization Steps

1. **Analyze:** Identify the core problems and tech stack in the JD.

2. **Experience Hyper-Alignment (PRIORITY):** - **Ruthless Relevance:** Rewrite experience bullet points to mirror the JD's priorities. If the JD emphasizes "Scaling," rewrite "Built web app" to "Scaled web architecture."
   - **Vocabulary Match:** Swap generic terms with the exact terminology used in the JD (e.g., if JD says "Squads," use "Squads" instead of "Teams").
   - **Keyword Injection:** Ensure the top 4 bullet points of the most recent role contain the most critical hard keywords from the JD.
   - **Deprioritize:** Shorten or remove bullet points about skills completely irrelevant to the target role.

3. **Project Injection (COMPACT):** - Add OR replace one project to be hyper-relevant to the JD.
   - **CRITICAL LENGTH CONSTRAINT:** Keep project descriptions **short and punchy** (max 3-4 lines). Focus strictly on Tech Stack + Business Outcome.

4. **ATS Formatting:** Ensure the LaTeX structure remains valid.

## ❌ Restrictions
- Do NOT invent employment history or education.
- Do NOT change job dates or titles.
- Do NOT output any analysis. Just the code.
`;

export async function POST(request: Request) {
  try {
    const { cvText, jobDescription } = await request.json();

    if (!cvText || !jobDescription) {
      return NextResponse.json(
        { error: "Both CV and Job Description are required." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Here is my LaTeX CV:\n${cvText}\n\nHere is the Job Description:\n${jobDescription}` 
        },
      ],
      model: "deepseek-chat", // Use "deepseek-reasoner" if you want "R1" logic, but "chat" is faster for CVs
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;

    return NextResponse.json({ result });

  } catch (error) {
    console.error("DeepSeek API Error:", error);
    return NextResponse.json(
      { error: "Failed to optimize CV. Please try again." },
      { status: 500 }
    );
  }
}