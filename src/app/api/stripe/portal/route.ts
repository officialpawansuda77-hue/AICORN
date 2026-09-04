import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || "http://localhost:3000";

    if (!stripe) {
      return NextResponse.json({ url: `${origin}/settings?portal_simulated=true` });
    }

    const { customerId } = await req.json().catch(() => ({ customerId: null }));
    if (!customerId) {
      return NextResponse.json({ url: `${origin}/settings` });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
