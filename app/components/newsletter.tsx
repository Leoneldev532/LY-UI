"use client";
import React, { useState } from "react";
import { toast } from "sonner";

/**
 * Newsletter subscription component.
 *
 * Props: None.
 *
 * This component is fully theme-aware (light/dark) and adapts its colors accordingly.
 */
const PROJECT_ID = process.env.NEXT_PUBLIC_SMADMAIL_PROJECT_ID!;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_SMADMAIL_PRIVATE_KEY!;
const API_URL = "https://api.smadmail.com/api/v1/email/save";

const NewsLetter: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          project_id: PROJECT_ID,
          private_key: PRIVATE_KEY,
          name: null,
        }),
      });

      if (res.status === 201) {
        setEmail("");
        toast.success("Successfully subscribed!");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.message || "Error during subscription.");
      }
    } catch (err) {
      toast.error("Network or server error.");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <div className="flex flex-col justify-start items-start gap-y-4 w-full">
      <h3 className="text-2xl text-left md:text-4xl w-full">
        <span className="opacity-70">Subscribe to our </span> Newsletter
      </h3>

      <form
        onSubmit={handleSubmit}
        className="w-full flex md:flex-row flex-col gap-4"
        autoComplete="off"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          pattern="^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$"
          className={`
            md:w-10/12 w-full py-2 px-3 rounded-lg border
            text-neutral-800 dark:text-neutral-100
            bg-neutral-100 dark:bg-neutral-800
            border-neutral-300 dark:border-neutral-700
            placeholder:text-neutral-500 dark:placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
            transition-colors duration-150
          `}
          placeholder="youremail@gmail.com"
          disabled={loading}
        />

        <button
          type="submit"
          className={`
            w-full md:w-2/12 flex justify-center items-center px-4 py-2 rounded-lg
            font-semibold transition-colors duration-150
            bg-neutral-900 text-white
            dark:bg-neutral-100 dark:text-neutral-900
            hover:bg-neutral-800 dark:hover:bg-neutral-200
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-b-transparent border-white dark:border-neutral-900 rounded-full"></div>
          ) : (
            "Subscribe"
          )}
        </button>
      </form>
    </div>
  );
};

export default NewsLetter;