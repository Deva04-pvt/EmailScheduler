import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { PDFDocument, rgb } from "pdf-lib";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendScheduledEmails = async () => {
  try {
    const now = new Date().toISOString();
    const { data: emails, error } = await supabase
      .from("scheduled_emails")
      .select("id, email, text")
      .eq("sent", false)
      .lte("send_time", now);

    if (error) throw error;
    if (!emails.length) return;

    for (const { id, email, text } of emails) {
      // Create PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 400]);
      page.drawText(text, { x: 50, y: 300, size: 20, color: rgb(0, 0, 0) });
      const pdfBytes = await pdfDoc.save();

      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Scheduled PDF",
        text: "Here is your scheduled PDF attachment.",
        attachments: [
          { filename: "document.pdf", content: pdfBytes, encoding: "base64" },
        ],
      });

      // Mark as sent
      await supabase
        .from("scheduled_emails")
        .update({ sent: true })
        .eq("id", id);
    }
  } catch (error) {
    console.error("Error sending scheduled emails:", error);
  }
};

// Run the job every minute
cron.schedule("* * * * *", sendScheduledEmails);
