import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or Create an Account | Puretech Enterprises" },
      { name: "description", content: "Sign in or create your Puretech Enterprises client account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone_number: z.string().trim().min(6, "Please enter a valid phone number").max(30),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password is required").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: parsed.data.full_name,
          phone_number: parsed.data.phone_number,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Please check your email to confirm.");
    navigate({ to: "/" });
  };

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/" });
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-xl border border-border bg-card p-6 shadow-soft">
        <h1 className="mb-1 text-2xl font-bold">Welcome to Puretech Enterprises</h1>
        <p className="mb-6 text-sm text-muted-foreground">Sign in or create your client account.</p>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <form onSubmit={onSignIn} className="space-y-4">
              <div>
                <Label htmlFor="si-email">Email</Label>
                <Input id="si-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div>
                <Label htmlFor="si-password">Password</Label>
                <Input id="si-password" name="password" type="password" autoComplete="current-password" required />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <div className="text-center text-sm">
                <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={onSignUp} className="space-y-4">
              <div>
                <Label htmlFor="su-name">Full name</Label>
                <Input id="su-name" name="full_name" type="text" autoComplete="name" required />
              </div>
              <div>
                <Label htmlFor="su-phone">Phone number</Label>
                <Input id="su-phone" name="phone_number" type="tel" autoComplete="tel" required />
              </div>
              <div>
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div>
                <Label htmlFor="su-password">Password</Label>
                <Input id="su-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground">
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
