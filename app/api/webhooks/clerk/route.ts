/* eslint-disable @typescript-eslint/no-explicit-any */
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  syncClerkUserToSupabase,
  createRoleProfile,
  deleteUserFromSupabase,
} from "@/utils/supabase/admin";

export async function POST(req: Request) {
  // Get the Webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as any;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  // Handle the webhook event
  const eventType = evt.type;
  console.log(`Received Clerk webhook: ${eventType}`);

  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name, image_url } =
          evt.data;

        // Sync user to Supabase
        const user = await syncClerkUserToSupabase(id, {
          email: email_addresses[0]?.email_address || "",
          firstName: first_name,
          lastName: last_name,
          avatarUrl: image_url,
          role: "learner", // Default role
        });

        // Create default learner profile
        await createRoleProfile(user.id, "learner");

        console.log(`User created and synced: ${id}`);
        break;
      }

      case "user.updated": {
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          image_url,
          public_metadata,
        } = evt.data;

        // Get role from public_metadata if it exists
        const role = public_metadata?.role;

        // Sync updated user data to Supabase
        const user = await syncClerkUserToSupabase(id, {
          email: email_addresses[0]?.email_address || "",
          firstName: first_name,
          lastName: last_name,
          avatarUrl: image_url,
          role: role || "learner",
        });

        // If role was updated, ensure profile exists
        if (role) {
          await createRoleProfile(user.id, role);
        }

        console.log(`User updated and synced: ${id}`);
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;

        // Delete user from Supabase (cascades to related tables)
        await deleteUserFromSupabase(id);

        console.log(`User deleted: ${id}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
