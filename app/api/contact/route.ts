

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_URL is missing");

      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const body: unknown = await request.json();

    if (typeof body !== "object" ||body === null ||!("name" in body) ||!("email" in body) ||!("message" in body)) {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }
    // destructuring 
    const { name, email, message } = body;
    if (typeof name !== "string" ||typeof email !== "string" ||typeof message!== "string") {
      return NextResponse.json(
        { error: "All fields must be text" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();


    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Website Contact Form",
        allowed_mentions: { parse: [] },
        embeds: [
          {
            
            fields: [
              {
                name: "Name",
                value: cleanName,
              },
              {
                name: "Email",
                value: cleanEmail,
              },
              {
                name: "Message",
                value: cleanMessage,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: "Website Contact Form",
            },
          },
        ],
      }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (!discordResponse.ok) {
      console.error(
        "Discord webhook failed:",
        discordResponse.status
      );

      return NextResponse.json(
        { error: "Could not deliver your submission" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Form submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      { error: "Unable to process your submission" },
      { status: 500 }
    );
  }
}
