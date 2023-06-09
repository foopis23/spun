import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'

export const appRouter = router({
  getPosts: publicProcedure
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
          },
          reactions: {
            select: {
              id: true,
              type: true
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
      const cursor =
        direction === 1
          ? result[result.length - 1]?.createdAt?.toISOString()
          : result[0]?.createdAt?.toISOString()

      // map like and dislike counts
      const data = result.map((post) => {
        const likes = post.reactions.filter(
          reaction => reaction.type === 'LIKE'
        ).length
        const dislikes = post.reactions.filter(
          reaction => reaction.type === 'DISLIKE'
        ).length

        return {
          author: post.author,
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          likes,
          dislikes
        }
      })

      return {
        data,
        cursor
      }
    }),
  getPost: publicProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.prisma.post.findUnique({
        where: {
          id: input.id
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          reactions: {
            select: {
              id: true,
              type: true
            }
          }
        }
      })

      if (!result) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post not found'
        })
      }

      const likes = result.reactions.filter(
        reaction => reaction.type === 'LIKE'
      ).length
      const dislikes = result.reactions.filter(
        reaction => reaction.type === 'DISLIKE'
      ).length

      return {
        author: result.author,
        id: result.id,
        content: result.content,
        createdAt: result.createdAt,
        likes,
        dislikes
      }
    }),
  getUserReactions: protectedProcedure
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
  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string().max(280)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = ctx.session?.user?.id as string
      const user = await ctx.prisma.user.findUnique({
        where: {
          id
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
  addPostReaction: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        type: z.enum(['LIKE', 'DISLIKE'])
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id as string
      const postId = input.postId
      const type = input.type

      await ctx.prisma.reaction.upsert({
        where: {
          postId_userId: {
            postId,
            userId
          }
        },
        update: {
          type
        },
        create: {
          userId,
          postId,
          type
        }
      })
    }),
  removePostReaction: protectedProcedure
    .input(
      z.object({
        postId: z.string()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id as string
      const postId = input.postId

      await ctx.prisma.reaction.delete({
        where: {
          postId_userId: {
            postId,
            userId
          }
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
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
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
