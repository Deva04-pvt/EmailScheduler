"use client";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [sendType, setSendType] = useState("send_now");
  const [sendTime, setSendTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const body = { text, email };
      let apiEndpoint = "/api/send-mail";

      if (sendType === "schedule" && sendTime) {
        body.sendTime = sendTime;
        apiEndpoint = "/api/schedule-mail";
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      setMessage(result.message || "Email request processed!");
    } catch (error) {
      setMessage("Failed to process email request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-black">Send PDF via Email</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <textarea
            className="w-full p-2 border border-gray-300 rounded text-black"
            rows="4"
            placeholder="Enter your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="Recipient Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select
            className="w-full p-2 border border-gray-300 rounded text-black"
            value={sendType}
            onChange={(e) => setSendType(e.target.value)}
          >
            <option value="send_now">Send Now</option>
            <option value="schedule">Schedule</option>
          </select>
          {sendType === "schedule" && (
            <input
              type="datetime-local"
              className="w-full p-2 border border-gray-300 rounded text-black"
              value={sendTime}
              onChange={(e) => setSendTime(e.target.value)}
              required
            />
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
          {message && (
            <p className="text-center mt-2 text-sm text-gray-700">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
