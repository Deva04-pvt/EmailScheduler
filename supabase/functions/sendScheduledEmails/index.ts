import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Function to send email (replace with your mail API)
async function sendEmail(to: string, subject: string, text: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "devanand.pvt.04@gmail.com",
      to,
      subject,
      text,
    }),
  });

  return res.ok;
}

// Main function
Deno.serve(async () => {
  console.log("Running scheduled email function...");

  // Step 1: Fetch emails that are due to be sent
  const { data: emails, error } = await supabase
    .from("scheduled_emails")
    .select("*")
    .lte("send_time", new Date().toISOString());

  if (error) {
    console.error("Error fetching scheduled emails:", error);
    return new Response("Failed to fetch scheduled emails", { status: 500 });
  }

  if (!emails || emails.length === 0) {
    console.log("No emails to send.");
    return new Response("No pending emails.", { status: 200 });
  }

  // Step 2: Loop through emails and send them
  for (const email of emails) {
    const success = await sendEmail(email.email, "Scheduled Email", email.text);

    if (success) {
      // Step 3: Delete the email from the database after sending
      await supabase.from("scheduled_emails").delete().eq("id", email.id);
      console.log(`Email sent to ${email.email} and deleted from DB.`);
    } else {
      console.error(`Failed to send email to ${email.email}`);
    }
  }

  return new Response("Processed scheduled emails", { status: 200 });
});
