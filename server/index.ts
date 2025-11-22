import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_KEY = process.env.API_KEY;

if (!OPENROUTER_KEY) {
  console.error("No OpenRouter API key found in .env file. Set API_KEY=your_key");
  process.exit(1);
}

interface OpenRouterChoice {
  message: {
    role: string;
    content: string;
  };
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
  error?: { message: string; code?: number };
}

async function callOpenRouter(prompt: string): Promise<string> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data: OpenRouterResponse = await response.json() as OpenRouterResponse;

    if (data.error) {
      console.error("OpenRouter API error:", data.error);
      return "AI analysis failed.";
    }

    const message = data.choices?.[0]?.message?.content;
    if (!message) {
      console.error("Unexpected response format:", data);
      return "AI analysis failed.";
    }

    return message;

  } catch (err) {
    console.error("Error calling OpenRouter:", err);
    return "AI analysis failed.";
  }
}

app.post("/aiAnalysis", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ analysis: "Prompt is required." });
  }

  const analysis = await callOpenRouter(prompt);
  res.json({ analysis });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});