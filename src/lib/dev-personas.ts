export type DevPersona = {
  key: string
  name: string
  email: string
  label: string
  description: string
}

export const DEV_PERSONAS: DevPersona[] = [
  {
    key: "super-admin",
    name: "Harshal More",
    email: "harshal.more@vit.edu.in",
    label: "Super admin",
    description: "On SUPER_ADMIN_EMAILS. Appoints admins.",
  },
  {
    key: "admin",
    name: "Neha Joshi",
    email: "neha.joshi@vit.edu.in",
    label: "Site admin",
    description: "Creates communities, appoints leads, moderates.",
  },
  {
    key: "lead",
    name: "Aarav Mehta",
    email: "aarav.mehta@vit.edu.in",
    label: "Community lead",
    description: "Lead of GDG on Campus VIT.",
  },
  {
    key: "manager",
    name: "Sneha Iyer",
    email: "sneha.iyer@vit.edu.in",
    label: "Community manager",
    description: "Manager at Coding Club VIT.",
  },
  {
    key: "volunteer",
    name: "Rohan Desai",
    email: "rohan.desai@vit.edu.in",
    label: "Volunteer",
    description: "Checks people in for Coding Club VIT.",
  },
  {
    key: "student",
    name: "Priya Nair",
    email: "priya.nair@vit.edu.in",
    label: "Student",
    description: "No team role. Registers for events.",
  },
]

export function findPersona(key: string | undefined): DevPersona | undefined {
  if (!key) return undefined
  return DEV_PERSONAS.find((p) => p.key === key)
}
