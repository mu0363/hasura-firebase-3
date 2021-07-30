import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2020-08-27",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  {
    if (req.method === "POST") {
      const amount: number = req.body.amount;
      console.log(amount);

      try {
        const params: Stripe.Checkout.SessionCreateParams = {
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [],
          success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}`,
        };
        const checkoutSession: Stripe.Checkout.Session =
          await stripe.checkout.sessions.create(params);

        res.status(200).json(checkoutSession);
      } catch (err) {
        res.status(500).json({ statusCode: 500, message: err.message });
      }
    } else {
      res.setHeader("Allow", "POST");
      res.status(405).end("Method Not Allowed");
    }
  }
}
