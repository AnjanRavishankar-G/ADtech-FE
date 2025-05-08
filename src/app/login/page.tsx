"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Cookies from "js-cookie";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordType, setPasswordType] = useState("password");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const togglePasswordType = () => {
        setPasswordType((prev) => (prev === "password" ? "text" : "password"));
    };

    async function handleSubmit(e: { preventDefault: () => void }) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(
                "https://a5ehaj23t5.execute-api.us-east-1.amazonaws.com/dev/api/Auth_login",
                {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                Cookies.set("auth_token", data.auth_token, { expires: 1 });
                Cookies.set("id_token", data.id_token, { expires: 1 });

                login(data.auth_token, data.id_token);

                router.push("/brand");
            } else {
                alert(data.error || "Login failed");
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen login-container">
            {/* Left side with logo and tagline */}
            <div className="hidden md:block md:w-1/2 bg-black relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="relative w-64 h-64 mb-8">
                        <Image
                            src="/artha-manta-logo-white.png"
                            alt="Artha Manta Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h2 className="text-2xl text-white text-center font-light">
                        Simplifying digital commerce
                    </h2>
                </div>
            </div>

            {/* Right side */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-4">
                <div className="w-full max-w-md login-card p-8 rounded-2xl shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email input */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block mb-2 font-medium"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                placeholder="youremail@example.com"
                                className="login-input w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                required
                            />
                        </div>

                        {/* Password input */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="password"
                                    className="font-medium"
                                >
                                    Password
                                </label>
                                <a
                                    href="#"
                                    className="text-sm font-medium text-purple-600 hover:text-purple-500"
                                >
                                    Forgot Password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={passwordType}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    disabled={isLoading}
                                    className="login-input w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                    required
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
                                    onClick={togglePasswordType}
                                >
                                    {passwordType === "password" ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                                clipRule="evenodd"
                                            />
                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-gray-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path
                                                fillRule="evenodd"
                                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <label
                                htmlFor="remember-me"
                                className="text-sm text-gray-600 cursor-pointer dark:text-white"
                            >
                                Remember me
                            </label>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded hover:shadow-lg transition duration-200 disabled:bg-purple-400"
                        >
                            {isLoading && (
                                <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isLoading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
