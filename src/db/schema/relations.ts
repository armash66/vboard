import { relations } from "drizzle-orm"
import { user } from "./auth"
import { community, communityMember } from "./communities"
import { post } from "./posts"
import { profile } from "./profiles"
import { registration } from "./registrations"

export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(profile, { fields: [user.id], references: [profile.userId] }),
  memberships: many(communityMember),
  registrations: many(registration),
}))

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, { fields: [profile.userId], references: [user.id] }),
}))

export const communityRelations = relations(community, ({ many }) => ({
  members: many(communityMember),
  posts: many(post),
}))

export const communityMemberRelations = relations(
  communityMember,
  ({ one }) => ({
    community: one(community, {
      fields: [communityMember.communityId],
      references: [community.id],
    }),
    user: one(user, {
      fields: [communityMember.userId],
      references: [user.id],
    }),
  })
)

export const postRelations = relations(post, ({ one, many }) => ({
  community: one(community, {
    fields: [post.communityId],
    references: [community.id],
  }),
  author: one(user, { fields: [post.authorId], references: [user.id] }),
  registrations: many(registration),
}))

export const registrationRelations = relations(registration, ({ one }) => ({
  post: one(post, { fields: [registration.postId], references: [post.id] }),
  user: one(user, { fields: [registration.userId], references: [user.id] }),
}))
