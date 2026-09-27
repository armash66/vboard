"use server"

import { revalidatePath } from "next/cache"
import { updateProfile } from "@/db/queries/profiles"
import { firstIssue, profileFormSchema } from "@/db/validations"
import { done, fail, type ActionResult } from "@/lib/action-result"
import { getSessionUser } from "@/lib/session"

export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await getSessionUser()
  if (!user) return fail("Sign in first.")
  const parsed = profileFormSchema.safeParse({
    rollNumber: formData.get("rollNumber") ?? "",
    department: formData.get("department") ?? "",
    bio: formData.get("bio") ?? "",
  })
  if (!parsed.success) return fail(firstIssue(parsed.error))
  await updateProfile(user.id, parsed.data)
  revalidatePath("/dashboard", "layout")
  return done("Profile saved.")
}
