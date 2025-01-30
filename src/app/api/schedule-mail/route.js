import { NextResponse } from "next/server";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req) {
  try {
    const { email, text, sendTime } = await req.json();

    if (!email || !text || !sendTime) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }

    // Store scheduled email in the database
    await pool.query(
      "INSERT INTO scheduled_emails (email, text, send_time) VALUES ($1, $2, $3)",
      [email, text, sendTime]
    );

    return new Response(JSON.stringify({ message: "Email scheduled successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error scheduling email:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}
