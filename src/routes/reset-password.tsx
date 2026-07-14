import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | Puretech Enterprises" },
      { name: "description", content: "Choose a new password for your Puretech Enterprises account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. You are signed in.");
    navigate({ to: "/" });
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-xl border border-border bg-card p-6 shadow-soft">
        <h1 className="mb-1 text-2xl font-bold">Set a new password</h1>
        <p className="mb-6 text-sm text-muted-foreground">Enter and confirm your new password.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="rp-password">New password</Label>
            <Input id="rp-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <div>
            <Label htmlFor="rp-confirm">Confirm password</Label>
            <Input id="rp-confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground">
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </section>
  );
}
