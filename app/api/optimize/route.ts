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

Your task is to rewrite the CV to strictly match the job description using ATS keywords, action verbs, and relevant project additions.

## ⚡ OUTPUT RULES (STRICT)
1. **NO CONVERSATIONAL TEXT:** Output raw text only.
2. **NO MARKDOWN:** Do not use code fences.
3. **START IMMEDIATELY:** Start with \\documentclass...
4. **END IMMEDIATELY:** End with \\end{document}

## 🚫 FORBIDDEN TECHNOLOGIES (CRITICAL)
- **NO JAVA:** The user explicitly dislikes Java. **NEVER** add "Java" to the Skills, Experience, or Projects sections, even if the Job Description requires it. Ignore it completely.

## 📏 LENGTH CONSTRAINTS
- **MAX 110 CHARACTERS PER BULLET POINT:** Every single bullet point must be under 110 characters.
- **CONCISE & PUNCHY:** Remove "fluff" words.
- **DENSITY:** Maximize keyword density within this limit.

## 🛠️ Optimization Steps

1. **Analyze:** Identify the core problems and tech stack in the JD.

2. **Experience Hyper-Alignment:**
   - **Ruthless Relevance:** Rewrite bullet points to mirror the JD's priorities (using the JD's vocabulary).
   - **Keyword Injection:** Ensure the top bullet points contain critical hard keywords.

3. **Project Injection (COMPACT):** - Add OR replace one project to be hyper-relevant to the JD.
   - Keep project descriptions strictly under the 110-character limit per line.
   - Focus strictly on Tech Stack + Business Outcome.

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
