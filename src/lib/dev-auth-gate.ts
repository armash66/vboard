export const DEV_ACTOR_COOKIE = "vboard_dev_actor"

export function devAuthEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" && process.env.VBOARD_DEV_AUTH === "1"
  )
}
