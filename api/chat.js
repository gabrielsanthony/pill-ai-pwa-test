export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, language, simplify } = req.body;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful New Zealand medicine assistant. Answer in ${language}.`
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: simplify ? 0.5 : 0.7
      })
    });

    const data = await openaiRes.json();

    // 🧠 LOG THE FULL RESPONSE FOR DEBUGGING
    console.log("🧠 OpenAI response:", JSON.stringify(data, null, 2));

    if (data.choices?.[0]?.message?.content) {
      res.status(200).json({ answer: data.choices[0].message.content });
    } else {
      // LOG MISSING CHOICE
      console.warn("⚠️ No message content in OpenAI response:", data);
      res.status(200).json({ answer: "⚠️ No response received." });
    }
  } catch (error) {
    console.error("❌ Error contacting OpenAI:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}