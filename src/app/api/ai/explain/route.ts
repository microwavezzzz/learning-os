import { NextResponse } from "next/server";
import { aiGateway } from "@/lib/ai/ai-gateway";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.concept) {
      return NextResponse.json({ error: "concept is required" }, { status: 400 });
    }

    const explanation = await aiGateway.explainConcept(body.concept, body.context);
    return NextResponse.json(explanation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
