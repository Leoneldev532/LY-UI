"use client";
import React, { useState } from 'react';
import { toast } from 'sonner';

const PROJECT_ID = process.env.NEXT_PUBLIC_SMADMAIL_PROJECT_ID!;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_SMADMAIL_PRIVATE_KEY!;

const API_URL = "https://api.smadmail.com/api/v1/email/save";

const NewsLetter = () => {
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.trim(),
                    project_id: PROJECT_ID,
                    private_key: PRIVATE_KEY,
                    name: null 
                })
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

            <form onSubmit={handleSubmit} className="w-full flex md:flex-row flex-col gap-4">
                <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    pattern="^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$" 
                    className='md:w-10/12 w-full py-2 bg-neutral-400 text-black dark:text-white dark:bg-neutral-900 px-2 border border-neutral-600 rounded-lg' 
                    placeholder='youremail@gmail.com' 
                />

                <button
                    type="submit"
                    className="dark:bg-white bg-neutral-900 dark:text-black text-white text-customBlack px-4 py-2 rounded-lg w-full md:w-2/12 flex justify-center items-center"
                    disabled={loading}
                >
                    {loading ? (
                        <div className='animate-spin h-4 w-4 border-b-2 border-black border-t-transparent rounded-full'></div>
                    ) : (
                        "Subscribe"
                    )}
                </button>
            </form>
        </div>
    );
};

export default NewsLetter;