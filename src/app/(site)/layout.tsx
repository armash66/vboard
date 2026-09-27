import { Footer } from "@/components/footer"
import { Nav } from "@/components/nav"
import { getSessionUser } from "@/lib/session"

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  return (
    <>
      <Nav user={user ? { name: user.name } : null} />
      <main className="container pt-28 pb-16">{children}</main>
      <Footer />
    </>
  )
}
