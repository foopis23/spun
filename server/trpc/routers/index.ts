import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'

export const appRouter = router({
  getPosts: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().max(25).default(25)
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.prisma.post.findMany({
        take: input.limit,
        skip: input.cursor ? 1 : undefined,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        cursor: input.cursor
          ? {
              createdAt: new Date(input.cursor)
            }
          : undefined
      })

      const direction = input.limit > 0 ? 1 : -1
      const cursor = (direction === 1) ? result[result.length - 1]?.createdAt?.toISOString() : result[0]?.createdAt?.toISOString()

      return {
        data: result,
        cursor
      }
    }),
  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string().max(280)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const email = ctx.session?.user?.email as string
      const user = await ctx.prisma.user.findUnique({
        where: {
          email
        }
      })

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create a post'
        })
      }

      return await ctx.prisma.post.create({
        data: {
          authorId: user.id,
          content: input.content
        }
      })
    }),
  patchMyProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().max(255).optional()
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
          name: input.name
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })
    }),
  getMyProfile: protectedProcedure
    .query(async ({ ctx }) => {
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
          email: true
        }
      })
    })
})

// export type definition of API
export type AppRouter = typeof appRouter;
