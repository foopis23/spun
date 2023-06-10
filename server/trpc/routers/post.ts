import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'
import { bannedWords } from '~/util/banned-words'

export const postRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().max(25).default(25),
        authorId: z.string().optional()
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.prisma.post.findMany({
        take: input.limit,
        skip: input.cursor ? 1 : undefined,
        orderBy: [
          {
            createdAt: 'desc'
          },
          {
            id: 'desc'
          }
        ],
        where: {
          authorId: input.authorId
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
              id: input.cursor
            }
          : undefined
      })

      const direction = input.limit > 0 ? 1 : -1
      const cursor =
        direction === 1
          ? result[result.length - 1]?.id
          : result[0]?.id

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
  get: publicProcedure
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
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().max(280)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = ctx.session?.user?.id as string

      if (bannedWords.some(word => input.content.toLowerCase().trim().includes(word))) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Post contains banned words'
        })
      }

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
  addReaction: protectedProcedure
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
  removeReaction: protectedProcedure
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
    })
})
