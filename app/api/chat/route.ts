import { NextResponse } from 'next/server';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'FoundLabs_FAQ.md');

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // Read the entire knowledge base file
    const knowledgeBase = fs.readFileSync(dataFilePath, 'utf-8');

    const systemPrompt = `
    You are a customer support assistant. Use the following knowledge base to answer questions.
    If the information isn't available, respond with:
    "I couldn't find that information. Please contact foundlabs.online@gmail.com for assistance."

    KNOWLEDGE BASE:
    ${knowledgeBase}
    `;

    const token = process.env.GITHUB_TOKEN;
    const endpoint = process.env.GITHUB_MODELS_ENDPOINT;
    const model = process.env.GITHUB_MODEL;

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.3,  // Lower for more factual responses
        top_p: 0.9,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error?.message);
    }

    const answer = response.body.choices[0]?.message?.content?.trim();

    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        response: "I'm having trouble processing your request. " + 
                 "Please contact foundlabs.online@gmail.com for assistance."
      },
      { status: 500 }
    );
  }
}