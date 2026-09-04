import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ received: true, note: "Webhook received in demo mode" });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed":
        // Handle subscription checkout completed
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // Handle plan tier upgrade/downgrade/cancellation
        break;
      case "invoice.payment_failed":
        // Handle payment failure notification
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err.message);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
