import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/portal/AuthLayout";

export const Route = createFileRoute("/portal/register")({
  head: () => ({
    meta: [
      { title: "Register — Client Portal | Puretech Enterprises" },
      { name: "description", content: "Register for the Puretech Enterprises Client Portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalRegister,
});

const schema = z
  .object({
    company_name: z.string().trim().min(2, "Company name is required").max(150),
    contact_person: z.string().trim().min(2, "Contact person is required").max(100),
    email: z.string().trim().email("Invalid email").max(255),
    phone_number: z.string().trim().min(6, "Valid phone required").max(30),
    business_address: z.string().trim().min(4, "Business address is required").max(300),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirm: z.string().min(1, "Please confirm your password").max(72),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

function PortalRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/portal/login`,
        data: {
          full_name: parsed.data.contact_person,
          contact_person: parsed.data.contact_person,
          phone_number: parsed.data.phone_number,
          company_name: parsed.data.company_name,
          business_address: parsed.data.business_address,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSubmitted(true);
    toast.success("Registration received");
  };

  if (submitted) {
    return (
      <AuthLayout title="Registration Received" wide>
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <p className="text-sm text-foreground">
            Your registration has been received. Your account will become active
            after administrator approval. You will receive an email once your
            account is approved.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button asChild className="bg-gradient-brand text-primary-foreground">
              <Link to="/">Return to website</Link>
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/portal/login" })}>
              Go to sign in
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Your Client Account"
      subtitle="Register to manage projects, documents and payments online."
      wide
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input id="company_name" name="company_name" required />
          </div>
          <div>
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input id="contact_person" name="contact_person" autoComplete="name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input id="phone_number" name="phone_number" type="tel" autoComplete="tel" required />
          </div>
        </div>
        <div>
          <Label htmlFor="business_address">Business Address</Label>
          <Textarea id="business_address" name="business_address" rows={2} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-primary-foreground">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/portal/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
