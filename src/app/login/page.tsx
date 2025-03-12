"use client";
import React from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';

const schema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4),
});

const LogInForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const [passwordType, setPasswordType] = React.useState("password");

  const togglePasswordType = () => {
    setPasswordType((prev) => (prev === "password" ? "text" : "password"));
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      email: "dashtail@codeshaper.net",
      password: "password",
    },
  });

  const onSubmit = (data: { email: string; password: string }) => {
    startTransition(async () => {
      let response = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (response?.ok) {
        toast.success("Login Successful");
        window.location.assign("/dashboard");
        reset();
      } else if (response?.error) {
        toast.error(response?.error);
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block md:w-1/2 bg-blue-100 dark:bg-gray-800 relative">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="relative w-full h-full">
            <Image 
              src="/login-image.jpg" 
              alt="Login" 
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-lg"
              priority
            />
            <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/70 to-transparent w-full">
              <h2 className="text-white text-2xl font-bold">Welcome to Ad Tech Platform</h2>
              <p className="text-white/80 mt-2">Manage your advertising campaigns efficiently</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md dark:bg-black">
          <Link href="/dashboard" className="inline-block">
            <div className="h-10 w-10 2xl:w-14 2xl:h-14 text-primary">Logo</div>
          </Link>
          <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-gray-900 dark:text-white">
            Hey, Hello 👋
          </div>
          <div className="2xl:text-lg text-base text-gray-600 2xl:mt-2 leading-6 dark:text-white">
            Enter the information you entered while registering.
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7">
            <div>
              <label htmlFor="email" className="mb-2 font-medium text-gray-600 dark:text-white">
                Email
              </label>
              <input
                disabled={isPending}
                {...register("email")}
                type="email"
                id="email"
                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'} dark:text-white dark:bg-[#1e1e1e]`}
                placeholder="Email"
              />
            </div>
            {errors.email && (
              <div className="text-red-500 mt-2">{errors.email.message}</div>
            )}

            <div className="mt-3.5">
              <label htmlFor="password" className="mb-2 font-medium text-gray-600 dark:text-white">
                Password
              </label>
              <div className="relative">
                <input
                  disabled={isPending}
                  {...register("password")}
                  type={passwordType}
                  id="password"
                  className="w-full p-2 border border-gray-300 rounded dark:bg-[#1e1e1e]"
                  placeholder="Password"
                />

                <div
                  className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
                  onClick={togglePasswordType}
                >
                  {passwordType === "password" ? "👁️" : "🙈"}
                </div>
              </div>
            </div>
            {errors.password && (
              <div className="text-red-500 mt-2">{errors.password.message}</div>
            )}

            <div className="mt-5 mb-8 flex flex-wrap gap-2">
              <div className="flex-1 flex items-center gap-1.5">
                <input type="checkbox" id="isRemebered" className="border-default-300 mt-[1px]" />
                <label htmlFor="isRemebered" className="text-sm text-gray-600 cursor-pointer dark:text-white">
                  Remember me
                </label>
              </div>
              <Link href="/auth/forgot" className="flex-none text-sm text-blue-500">
                Forget Password?
              </Link>
            </div>

            <button
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Loading..." : "Sign In"}
            </button>
          </form>
          <div className="mt-6 xl:mt-8 flex flex-wrap justify-center gap-4">
            <button type="button" className="p-2 border rounded-full">
              <img src="path/to/googleIcon.png" alt="google" className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 border rounded-full">
              <img src="path/to/GithubIcon.png" alt="github" className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 border rounded-full">
              <img src="path/to/facebook.png" alt="facebook" className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 border rounded-full">
              <img src="path/to/twitter.png" alt="twitter" className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 2xl:mt-8 text-center text-base text-gray-600 dark:text-white">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-500">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogInForm;