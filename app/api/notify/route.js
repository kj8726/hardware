import { NextResponse } from "next/server";

/**
 * Sends email notifications using Resend (free tier: 3000 emails/month)
 * To enable: npm install resend  →  add RESEND_API_KEY to .env.local
 * Get free API key at: https://resend.com
 */

export async function POST(request) {
  try {
    const { type, to, data } = await request.json();

    // If no Resend key configured, skip silently (don't break the app)
    if (!process.env.RESEND_API_KEY) {
      console.log("📧 Email skipped (RESEND_API_KEY not set):", type);
      return NextResponse.json({ message: "Email skipped - no API key" });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    let subject = "";
    let html = "";

    if (type === "new_response") {
      subject = `💬 ${data.shopName} responded to your request — HardwareHub`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #f5f5f4; padding: 32px; border-radius: 16px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
            <div style="background: #f97316; width: 36px; height: 36px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 18px;">🔩</div>
            <span style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">HARDWARE<span style="color: #f97316;">HUB</span></span>
          </div>

          <h2 style="color: #f97316; font-size: 24px; margin: 0 0 8px;">You got a response!</h2>
          <p style="color: #737373; margin: 0 0 24px;">A shop has responded to your part request.</p>

          <div style="background: #161616; border: 1px solid #252525; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">Your Request</p>
            <p style="color: #f5f5f4; font-weight: 700; font-size: 18px; margin: 0 0 16px;">${data.requestTitle}</p>

            <div style="border-top: 1px solid #252525; padding-top: 16px;">
              <p style="color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px;">Shop Response from ${data.shopName}</p>
              <p style="color: #f97316; font-size: 28px; font-weight: 900; margin: 0 0 8px;">₹${data.price}</p>
              ${data.deliveryTime ? `<p style="color: #737373; font-size: 13px; margin: 0 0 8px;">🚚 Delivery: ${data.deliveryTime}</p>` : ""}
              <p style="color: #f5f5f4; font-size: 14px; margin: 0;">${data.message}</p>
            </div>
          </div>

          <a href="${process.env.NEXTAUTH_URL}/requests/${data.requestId}"
            style="display: inline-block; background: #f97316; color: white; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px;">
            View All Responses →
          </a>

          <p style="color: #444; font-size: 12px; margin-top: 32px;">
            You received this because you posted a request on HardwareHub.<br/>
            <a href="${process.env.NEXTAUTH_URL}" style="color: #f97316;">hardwarehub.vercel.app</a>
          </p>
        </div>
      `;
    }

    if (type === "request_posted") {
      subject = `✅ Your request is live — HardwareHub`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #f5f5f4; padding: 32px; border-radius: 16px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
            <div style="background: #f97316; width: 36px; height: 36px; border-radius: 6px; font-size: 18px; display:flex; align-items:center; justify-content:center;">🔩</div>
            <span style="font-size: 20px; font-weight: 900;">HARDWARE<span style="color: #f97316;">HUB</span></span>
          </div>
          <h2 style="color: #4ade80; font-size: 24px; margin: 0 0 8px;">Request Posted!</h2>
          <p style="color: #737373; margin: 0 0 20px;">Your part request is now live and shops can start responding.</p>
          <div style="background: #161616; border: 1px solid #252525; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #f5f5f4; font-weight: 700; font-size: 18px; margin: 0 0 8px;">${data.requestTitle}</p>
            <p style="color: #737373; font-size: 13px; margin: 0;">📍 ${data.city} · ${data.category}</p>
          </div>
          <a href="${process.env.NEXTAUTH_URL}/requests/${data.requestId}"
            style="display: inline-block; background: #f97316; color: white; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px;">
            View Your Request →
          </a>
        </div>
      `;
    }

    await resend.emails.send({
      from: "HardwareHub <noreply@hardwarehub.in>",
      to,
      subject,
      html,
    });

    return NextResponse.json({ message: "Email sent" });
  } catch (error) {
    // Never crash the main request if email fails
    console.error("Email notification error:", error);
    return NextResponse.json({ message: "Email failed silently" });
  }
}
