"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCommunityById } from "@/db/queries/communities"
import { getPostById, getSeatsTaken } from "@/db/queries/posts"
import {
  getRegistration,
  setRegistrationStatus,
  upsertRegistration,
} from "@/db/queries/registrations"
import { done, fail, type ActionResult } from "@/lib/action-result"
import {
  initialStatus,
  isActiveRegistration,
  registrationAvailability,
} from "@/lib/registration"
import { getSessionUser } from "@/lib/session"

const input = z.object({ postId: z.uuid() })

const UNAVAILABLE: Record<string, string> = {
  not_event: "This post is not an event.",
  unavailable: "This event is not open for registration.",
  not_open: "Registration has not opened yet.",
  closed: "Registration has closed.",
  full: "This event is full.",
}

function revalidate(slug: string) {
  revalidatePath(`/posts/${slug}`)
  revalidatePath("/dashboard", "layout")
}

export async function registerAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await getSessionUser()
  if (!user) return fail("Sign in to register.")
  const parsed = input.safeParse({ postId: formData.get("postId") })
  if (!parsed.success) return fail("Unknown event.")

  const post = await getPostById(parsed.data.postId)
  if (!post) return fail("Unknown event.")
  const community = await getCommunityById(post.communityId)
  if (!community?.isActive) return fail("This event is no longer available.")

  const existing = await getRegistration(post.id, user.id)
  if (existing && isActiveRegistration(existing.status))
    return fail("You are already registered.")
  if (existing?.status === "rejected")
    return fail("The organisers declined your request for this event.")

  const availability = registrationAvailability(
    post,
    await getSeatsTaken(post.id)
  )
  if (availability !== "open") return fail(UNAVAILABLE[availability])

  const status = initialStatus(post)
  await upsertRegistration({ postId: post.id, userId: user.id, status })

  if (status === "approved" && post.capacity !== null) {
    const taken = await getSeatsTaken(post.id)
    if (taken > post.capacity) {
      const mine = await getRegistration(post.id, user.id)
      if (mine) await setRegistrationStatus([mine.id], "cancelled", null)
      revalidate(post.slug)
      return fail("The last seat was just taken.")
    }
  }

  revalidate(post.slug)
  return done(
    status === "pending"
      ? "Request sent. You will see the decision here."
      : "You are registered."
  )
}

export async function cancelRegistrationAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await getSessionUser()
  if (!user) return fail("Sign in first.")
  const parsed = input.safeParse({ postId: formData.get("postId") })
  if (!parsed.success) return fail("Unknown event.")

  const post = await getPostById(parsed.data.postId)
  if (!post) return fail("Unknown event.")
  const existing = await getRegistration(post.id, user.id)
  if (!existing || !["pending", "approved"].includes(existing.status))
    return fail("There is no registration to cancel.")

  await setRegistrationStatus([existing.id], "cancelled", user.id)
  revalidate(post.slug)
  return done("Registration cancelled.")
}
