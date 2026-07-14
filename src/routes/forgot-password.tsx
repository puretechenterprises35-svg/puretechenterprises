import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password | Puretech Enterprises" },
      { name: "description", content: "Request a password reset link for your Puretech Enterprises account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().trim().email("Invalid email").max(255) });

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("If an account exists, a reset link has been sent.");
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-xl border border-border bg-card p-6 shadow-soft">
        <h1 className="mb-1 text-2xl font-bold">Forgot your password?</h1>
        <p className="mb-6 text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>

        {sent ? (
          <p className="text-sm">Check your inbox for the reset link. <Link to="/auth" className="text-primary hover:underline">Back to sign in</Link></p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fp-email">Email</Label>
              <Input id="fp-email" name="email" type="email" autoComplete="email" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground">
              {loading ? "Sending..." : "Send reset link"}
            </Button>
            <div className="text-center text-sm">
              <Link to="/auth" className="text-primary hover:underline">Back to sign in</Link>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
