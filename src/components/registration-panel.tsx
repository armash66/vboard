"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { ActionForm } from "@/components/action-form"
import { ConfirmSubmit } from "@/components/confirm-submit"
import { SubmitButton } from "@/components/submit-button"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  cancelRegistrationAction,
  registerAction,
} from "@/app/(site)/posts/[slug]/actions"
import type {
  RegistrationAvailability,
  RegistrationStatus,
} from "@/lib/registration"

type Props = {
  postId: string
  slug: string
  signedIn: boolean
  requiresApproval: boolean
  availability: RegistrationAvailability
  status: RegistrationStatus | null
  closesOn: string | null
  seatsLeft: number | null
}

const STATUS_COPY: Partial<Record<RegistrationStatus, string>> = {
  pending: "Request sent — waiting for the organisers",
  approved: "You're registered",
  attended: "Checked in. Enjoy the event",
  rejected: "The organisers declined this request",
  no_show: "Marked as not attended",
}

const AVAILABILITY_COPY: Record<RegistrationAvailability, string> = {
  not_event: "",
  unavailable: "Registration is not available",
  not_open: "Registration has not opened yet",
  closed: "Registration has closed",
  full: "This event is full",
  open: "",
}

export function RegistrationPanel(props: Props) {
  const active =
    props.status === "pending" ||
    props.status === "approved" ||
    props.status === "attended"
  const headline =
    props.status && props.status !== "cancelled"
      ? STATUS_COPY[props.status]
      : props.availability === "open"
        ? props.requiresApproval
          ? "Approval required — request to join"
          : "Open — register with one tap"
        : AVAILABILITY_COPY[props.availability]

  return (
    <aside
      className="surface sticky bottom-4 z-10 flex flex-col items-stretch justify-between gap-5 p-6 md:flex-row md:items-center"
      style={{ background: "var(--bg-elevated)" }}
    >
      <div className="space-y-1">
        <div className="mono-label">Registration</div>
        <div className="text-base" style={{ color: "var(--text)" }}>
          {headline}
        </div>
        <div className="font-mono text-sm" style={{ color: "var(--text-dim)" }}>
          {[
            props.closesOn ? `Closes ${props.closesOn}` : null,
            props.seatsLeft !== null ? `${props.seatsLeft} spots left` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>

      {!props.signedIn ? (
        <Link
          href={`/login?next=/posts/${props.slug}`}
          className={buttonVariants({ size: "lg", className: "px-6" })}
        >
          Sign in to register
          <ArrowUpRight data-icon="inline-end" aria-hidden />
        </Link>
      ) : props.status === "pending" || props.status === "approved" ? (
        <ActionForm action={cancelRegistrationAction}>
          <input type="hidden" name="postId" value={props.postId} />
          <ConfirmSubmit
            label="Cancel registration"
            title="Cancel your registration?"
            description="Your seat goes back to the pool."
            confirmLabel="Cancel registration"
            variant="outline"
            size="lg"
          />
        </ActionForm>
      ) : !active &&
        props.status !== "rejected" &&
        props.availability === "open" ? (
        <ActionForm action={registerAction}>
          <input type="hidden" name="postId" value={props.postId} />
          <SubmitButton size="lg" className="px-6" pendingLabel="Sending…">
            {props.requiresApproval ? "Request to join" : "Register"}
            <ArrowUpRight data-icon="inline-end" aria-hidden />
          </SubmitButton>
        </ActionForm>
      ) : null}
    </aside>
  )
}
