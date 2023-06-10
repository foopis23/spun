import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const myRouter = router({
  getReactions: protectedProcedure
    .input(
      z.object({
        postIds: z.array(z.string())
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id as string
      const postIds = input.postIds

      const reactions = await ctx.prisma.reaction.findMany({
        where: {
          postId: {
            in: postIds
          },
          userId
        },
        select: {
          postId: true,
          type: true
        }
      })

      return reactions.reduce(
        (acc: Record<string, (typeof reactions)[0]['type']>, reaction) => {
          return {
            ...acc,
            [reaction.postId]: reaction.type
          }
        },
        {}
      )
    }),
  patchProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().max(255).optional(),
        bio: z.string().max(255).optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = ctx.session?.user?.id
      if (!id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to update your profile'
        })
      }

      return await ctx.prisma.user.update({
        where: {
          id
        },
        data: {
          name: input.name,
          bio: input.bio
        },
        select: {
          id: true,
          name: true,
          email: true,
          bio: true
        }
      })
    }),
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const id = ctx.session?.user?.id
    if (!id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to update your profile'
      })
    }

    return await ctx.prisma.user.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true
      }
    })
  })
})
