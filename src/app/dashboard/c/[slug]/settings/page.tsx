import { ActionForm } from "@/components/action-form"
import { Panel } from "@/components/dashboard/ui"
import { SubmitButton } from "@/components/submit-button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { requireCommunityAccess } from "@/lib/session"
import { updateCommunityAction } from "./actions"

export default async function CommunitySettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { community } = await requireCommunityAccess(slug, "community:update")

  return (
    <Panel
      title="Community details"
      description="Shown on the public community page."
      className="max-w-2xl"
    >
      <ActionForm
        key={[community.name, community.description, community.logoUrl].join(
          "|"
        )}
        action={updateCommunityAction}
      >
        <input type="hidden" name="slug" value={slug} />
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              defaultValue={community.name}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">About</FieldLabel>
            <Textarea
              id="description"
              name="description"
              defaultValue={community.description}
              maxLength={600}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="logoUrl">Logo URL</FieldLabel>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              defaultValue={community.logoUrl ?? ""}
              placeholder="https://"
            />
            <FieldDescription>
              Image uploads arrive with R2 storage.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="address">Address</FieldLabel>
            <Input
              id="address"
              value={`/communities/${community.slug}`}
              readOnly
              disabled
            />
          </Field>
          <div>
            <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
          </div>
        </FieldGroup>
      </ActionForm>
    </Panel>
  )
}
