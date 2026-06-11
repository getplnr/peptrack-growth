"use server";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/** Update an outreach message's status (approve / mark sent / reject/archive). */
export async function setMessageStatus(id: string, status: string): Promise<{ ok: boolean; reason?: string }> {
  const sb = supabaseAdmin();
  if (!sb) return { ok: false, reason: "Supabase not configured" };
  const patch: Record<string, unknown> = { status };
  if (status === "approved") { patch.approved_at = new Date().toISOString(); patch.approved_by = "Jordan"; }
  if (status === "sent") patch.sent_at = new Date().toISOString();
  const { error } = await sb.from("outreach_messages").update(patch).eq("id", id);
  revalidatePath("/approvals");
  revalidatePath("/daily");
  return error ? { ok: false, reason: error.message } : { ok: true };
}

/** Save an edited draft body. */
export async function setMessageBody(id: string, body: string): Promise<{ ok: boolean; reason?: string }> {
  const sb = supabaseAdmin();
  if (!sb) return { ok: false, reason: "Supabase not configured" };
  const { error } = await sb.from("outreach_messages").update({ body }).eq("id", id);
  revalidatePath("/approvals");
  return error ? { ok: false, reason: error.message } : { ok: true };
}

/** Save a found public email onto a prospect (so future drafts have it). */
export async function setProspectContact(prospectId: string, email: string): Promise<{ ok: boolean; reason?: string }> {
  const sb = supabaseAdmin();
  if (!sb) return { ok: false, reason: "Supabase not configured" };
  const { error } = await sb.from("prospects").update({ email, contact_status: "found" }).eq("id", prospectId);
  revalidatePath("/approvals");
  revalidatePath("/prospects");
  return error ? { ok: false, reason: error.message } : { ok: true };
}
