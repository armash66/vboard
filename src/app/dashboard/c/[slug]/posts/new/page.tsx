import { EMPTY_POST, PostForm } from "@/components/dashboard/post-form"
import { requireCommunityAccess } from "@/lib/session"
import { createPostAction } from "../actions"

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const access = await requireCommunityAccess(slug, "post:write")
  return (
    <PostForm
      action={createPostAction}
      slug={slug}
      defaults={EMPTY_POST}
      canPublish={access.can("post:publish")}
      mode="create"
    />
  )
}
