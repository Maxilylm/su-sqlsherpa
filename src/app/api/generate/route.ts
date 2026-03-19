import Groq from "groq-sdk";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return Response.json(
        { error: "Please describe what you want the SQL query to do." },
        { status: 400 }
      );
    }

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are SQLSherpa, an expert SQL developer. Given a plain-English description of what the user wants, generate a SQL query. Format your response in Markdown with these sections:

## Generated SQL
The SQL query in a \`\`\`sql code block. Use standard SQL that works across most databases. Use clear formatting with proper indentation.

## Explanation
A brief numbered list explaining what each part of the query does.

## Assumptions
List any assumptions you made about table names, column names, or data types. Suggest the user adjust these to match their actual schema.

## Tips
1-2 tips about how to optimize or extend the query for their use case.

Be practical and write production-quality SQL. Prefer explicit column names over SELECT *. Include appropriate aliases for readability.`,
        },
        {
          role: "user",
          content: `Generate a SQL query for the following requirement:\n\n${description}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const result = completion.choices[0]?.message?.content || "No SQL generated.";
    return Response.json({ result });
  } catch (error: unknown) {
    console.error("Generate API error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate SQL query.";
    return Response.json({ error: message }, { status: 500 });
  }
}
