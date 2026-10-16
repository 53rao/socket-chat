"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      setStatus("Message sent successfully!");
      form.reset();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col p-6">
      {/* Top Navigation Bar with Chat Button on the Left */}
      <nav className="w-full max-w-lg mx-auto mb-6 flex justify-start">
        <Link
          href="/chat"
          className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          💬 Open Chat Room
        </Link>
      </nav>

      {/* Contact Card */}
      <div className="w-full max-w-lg mx-auto bg-neutral-900 border border-neutral-800 p-8 sm:p-10 rounded-2xl shadow-2xl">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-white">
          Contact Us
        </h1>
        <p className="mb-8 text-sm text-neutral-400">
          Have a question or want to work together? Drop us a message.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-400">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              maxLength={100}
              required
              autoComplete="name"
              placeholder="Your name"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-white transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              maxLength={254}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-white transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-xs font-medium uppercase tracking-wider text-neutral-400">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              maxLength={3000}
              required
              placeholder="Type your message here..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-white transition-all duration-200 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-sm cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

          {status && (
            <p 
              role="status" 
              aria-live="polite"
              className={`text-center text-sm p-3 rounded-xl border ${
                status.includes("successfully") 
                  ? "bg-neutral-950 border-neutral-800 text-white" 
                  : "bg-red-950/50 border-red-900/50 text-red-300"
              }`}
            >
              {status}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}