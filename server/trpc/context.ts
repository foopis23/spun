import { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'
import { z } from 'zod'
import { getServerSession } from '#auth'

const sessionSchema = z.object({
  user: z.object({
    id: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    image: z.string().nullable().optional()
  }).optional(),
  expires: z.string()
})

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext (_event: H3Event) {
  const session = await getServerSession(_event)

  return {
    prisma: _event.context.prisma,
    session: session ? sessionSchema.parse(session) : null
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
