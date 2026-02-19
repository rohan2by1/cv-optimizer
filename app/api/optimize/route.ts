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

Your task is to **tune** the CV to match the job description (JD) while preserving the user's original voice and truth.

## ⚡ OUTPUT RULES (STRICT)
1. **NO CONVERSATIONAL TEXT:** Output raw text only.
2. **NO MARKDOWN:** Do not use code fences.
3. **START IMMEDIATELY:** Start with \\documentclass...
4. **END IMMEDIATELY:** End with \\end{document}

## 🚫 FORBIDDEN TECHNOLOGIES
- **NO JAVA:** Never add "Java". Ignore it completely.

## 📏 LENGTH CONSTRAINTS
- **MAX 110 CHARACTERS PER BULLET POINT:** Strictly enforced. Cut fluff words to fit.

## 🛠️ Optimization Steps
1. **Summary Alignment (Tone):**
   - **Tone the summary accoring to JD** Not completely just ats friendly.
   
2. **Experience Alignment (SUBTLE):**
   - **Do NOT rewrite completely.** Keep the core meaning and structure of the user's original bullet points.
   - **Synonym Swap:** Only change specific verbs or nouns to match the JD's vocabulary (e.g., if user wrote "Managed team," and JD says "Led Squads," change it to "Led Squads").
   - **Light Polish:** Fix grammar and flow, but keep the original achievement intact.

3. **Project Injection:**
   - Add OR replace one project to be relevant to the JD.
   - **Short & Punchy:** Max 2 lines per project. Focus on Tech Stack + Result.

4. **ATS Formatting:** Ensure the LaTeX structure remains valid.

## ❌ Restrictions
- Do NOT invent employment history.
- Do NOT change job dates or titles.
- Do NOT output analysis. Just the code.
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



