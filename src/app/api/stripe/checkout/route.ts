import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { pricing } from "@/config/quotas";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || "http://localhost:3000";

    if (!stripe) {
      // Demo mode fallback: redirect to pricing with success simulated
      return NextResponse.json({
        url: `${origin}/pricing?checkout_simulated=true`,
        demo: true,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Aicorn Pro Subscription",
              description: "20 video + 50 image prompt copies/month, JSON export, priority review, Pro badge",
            },
            unit_amount: 499, // $4.99
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/settings?session_id={CHECKOUT_SESSION_ID}&upgraded=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
