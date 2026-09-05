"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      router.push("/auth/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 ring-1 ring-primary/20">
          <UserPlus className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80">First Name</label>
              <Input
                {...register("firstName")}
                placeholder="John"
                className="bg-background/50 h-11 transition-all focus:ring-2 focus:ring-primary/20"
              />
              {errors.firstName && (
                <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80">Last Name</label>
              <Input
                {...register("lastName")}
                placeholder="Doe"
                className="bg-background/50 h-11 transition-all focus:ring-2 focus:ring-primary/20"
              />
              {errors.lastName && (
                <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Email</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="name@example.com"
              className="bg-background/50 h-11 transition-all focus:ring-2 focus:ring-primary/20"
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Password</label>
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="bg-background/50 h-11 transition-all focus:ring-2 focus:ring-primary/20"
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80">Confirm Password</label>
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              className="bg-background/50 h-11 transition-all focus:ring-2 focus:ring-primary/20"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11 font-medium text-md mt-6" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border/40 pt-6 pb-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-medium hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
