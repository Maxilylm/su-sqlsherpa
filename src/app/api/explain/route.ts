import Groq from "groq-sdk";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function POST(request: Request) {
  try {
    const { sql } = await request.json();

    if (!sql || typeof sql !== "string" || sql.trim().length === 0) {
      return Response.json({ error: "Please provide a SQL query." }, { status: 400 });
    }

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are SQLSherpa, an expert SQL tutor. Given a SQL query, provide a clear, structured explanation in plain English. Format your response in Markdown with these sections:

## Step-by-Step Breakdown
Numbered list explaining what each part of the query does, in execution order.

## Tables & Columns
List all tables and columns referenced, with brief descriptions of their likely purpose.

## JOINs Explained
If any JOINs exist, explain each one: the type (INNER, LEFT, RIGHT, FULL), which tables are joined, and what the ON condition means in plain English.

## WHERE Conditions
Translate each WHERE/HAVING condition into natural language.

## Performance Tips
Provide 2-3 actionable tips about potential performance issues (missing indexes, N+1 patterns, SELECT *, subquery optimization, etc.). If the query looks fine, say so.

## Pseudo-Code Equivalent
Show equivalent logic in simple pseudo-code that a non-SQL person could understand.

Be concise but thorough. Use \`inline code\` for SQL keywords, table names, and column names.`,
        },
        {
          role: "user",
          content: `Explain this SQL query:\n\n\`\`\`sql\n${sql}\n\`\`\``,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const explanation = completion.choices[0]?.message?.content || "No explanation generated.";
    return Response.json({ explanation });
  } catch (error: unknown) {
    console.error("Explain API error:", error);
    const message = error instanceof Error ? error.message : "Failed to explain SQL query.";
    return Response.json({ error: message }, { status: 500 });
  }
}
