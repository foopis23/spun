import GithubProvider from 'next-auth/providers/github'
import DiscordProvider from 'next-auth/providers/discord'
import TwitterProvider from 'next-auth/providers/twitter'
import { PrismaClient } from '@prisma/client'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { AuthOptions } from 'next-auth'
import { NuxtAuthHandler } from '#auth'
import { env } from '~/env'

const prisma = new PrismaClient()
const adapter = PrismaAdapter(prisma) as AuthOptions['adapter'] // TODO: Figure out why this is a problem
if (adapter === undefined) { throw new Error('Prisma adapter is undefined') }

export default NuxtAuthHandler({
  secret: env.AUTH_SECRET,
  callbacks: {
    session: ({ session, user }) => {
      if (!session?.user || !user) {
        return session
      }

      return {
        ...session,
        user: {
          ...session?.user,
          id: user.id
        }
      }
    }
  },
  pages: {
    signIn: '/login'
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GithubProvider.default({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR
    DiscordProvider.default({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET
    }),
    // @ts-expect-error You need to use .default here for it to work during SSR
    TwitterProvider.default({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: '2.0'
    })
  ],
  adapter
})
