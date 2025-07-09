import { NextResponse } from 'next/server';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'FoundLabs_FAQ.md');

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    console.log("📨 Incoming Message:", message);

    // Check environment variables
    const token = process.env.GITHUB_TOKEN;
    const endpoint = process.env.GITHUB_MODELS_ENDPOINT;
    const model = process.env.GITHUB_MODEL;

    if (!token || !endpoint || !model) {
      console.error("❌ Missing environment variables.");
      return NextResponse.json({
        response: "Server configuration error. Please contact foundlabs.online@gmail.com."
      }, { status: 500 });
    }

    console.log("🔐 Azure setup OK:", {
      endpoint,
      model
    });

    // Load knowledge base
    const knowledgeBase = fs.existsSync(dataFilePath)
      ? fs.readFileSync(dataFilePath, 'utf-8')
      : "";

    const systemPrompt = `
You are a helpful customer support assistant for FoundLabs.
Use ONLY the knowledge base below to answer user questions.
If the answer is not available, reply with:

"I couldn't find that information. Please contact foundlabs.online@gmail.com for assistance."

KNOWLEDGE BASE:
${knowledgeBase}
    `.trim();

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.3,
        top_p: 0.9,
        model: model
      }
    });

    console.log("📤 Azure raw response:", response.status);

    if (isUnexpected(response)) {
      console.error("⚠️ Azure returned error:", response.body?.error?.message);
      throw new Error(response.body?.error?.message || "Azure model error");
    }

    const answer = response.body?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      console.warn("⚠️ No answer returned from model.");
      return NextResponse.json({
        response: "I couldn't find that information. Please contact foundlabs.online@gmail.com for assistance."
      });
    }

    return NextResponse.json({ response: answer });

  } catch (error) {
    console.error("🔥 API error:", error);
    return NextResponse.json({
      response: "I'm having trouble processing your request. Please contact foundlabs.online@gmail.com for assistance."
    }, { status: 500 });
  }
}
