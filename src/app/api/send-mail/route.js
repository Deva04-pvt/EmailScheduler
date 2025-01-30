import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { PDFDocument, rgb } from "pdf-lib";
import dotenv from "dotenv";

dotenv.config();

export async function POST(req) {
  try {
    const { text, email } = await req.json();
    if (!text || !email) {
      return NextResponse.json(
        { error: "Missing text or email" },
        { status: 400 }
      );
    }

    // Create a PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: 50,
      y: height - 100,
      size: 20,
      color: rgb(0, 0, 0),
    });
    const pdfBytes = await pdfDoc.save();

    // Nodemailer setup
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email with PDF attachment
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your PDF Document",
      text: "Please find your PDF attached.",
      attachments: [
        {
          filename: "document.pdf",
          content: pdfBytes,
          encoding: "base64",
        },
      ],
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
