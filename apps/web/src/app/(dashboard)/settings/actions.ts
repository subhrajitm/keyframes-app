"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type FormState = { error: string; success: string };

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const fullName = (formData.get("full_name") as string).trim();
  if (!fullName) return { error: "Name is required", success: "" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) return { error: error.message, success: "" };

  revalidatePath("/settings");
  return { error: "", success: "Profile updated" };
}

export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
  const current = formData.get("current_password") as string;
  const next = formData.get("new_password") as string;
  const confirm = formData.get("confirm_password") as string;

  if (!current || !next || !confirm) return { error: "All fields are required", success: "" };
  if (next.length < 8) return { error: "New password must be at least 8 characters", success: "" };
  if (next !== confirm) return { error: "Passwords do not match", success: "" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current,
  });
  if (signInError) return { error: "Current password is incorrect", success: "" };

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message, success: "" };

  return { error: "", success: "Password updated" };
}

export async function updateEmail(_: FormState, formData: FormData): Promise<FormState> {
  const email = (formData.get("email") as string).trim().toLowerCase();
  if (!email) return { error: "Email is required", success: "" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email address", success: "" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (email === user.email) return { error: "That is already your current email", success: "" };

  const { error } = await supabase.auth.updateUser({ email });
  if (error) return { error: error.message, success: "" };

  return { error: "", success: "Confirmation sent — check both inboxes to complete the change" };
}

export async function updateApiKeys(_: FormState, formData: FormData): Promise<FormState> {
  const falKey = (formData.get("fal_api_key") as string).trim();
  const openrouterKey = (formData.get("openrouter_api_key") as string).trim();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("users")
    .update({ fal_api_key: falKey || null, openrouter_api_key: openrouterKey || null })
    .eq("id", user.id);
  if (error) return { error: error.message, success: "" };

  return { error: "", success: "API keys saved" };
}

export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Delete user row (cascades to projects, assets, generations)
  await supabase.from("users").delete().eq("id", user.id);
  await supabase.auth.signOut();
  redirect("/login");
}
