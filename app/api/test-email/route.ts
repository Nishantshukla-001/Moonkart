import { NextResponse } from "next/server";
import resend from "@/lib/resend";

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: "MoonKart <noreply@themoonkart.com>",
      to: ["moonkartinfo@gmail.com"],
      subject: "MoonKart Email Test",
      html: `
        <h2>MoonKart Email System Working 🎉</h2>
        <p>This is a test email from the MoonKart website.</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      data,
    });
  } catch (error) {
    console.error("Email error:", error);

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}