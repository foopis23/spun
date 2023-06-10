import { PrismaClient } from '@prisma/client'
import { LoremIpsum } from 'lorem-ipsum'

const prisma = new PrismaClient()

async function main () {
  const userNames = ['josh', 'BigSpence', 'megji', 'jamac', 'modestbrit', 'foopis23', 'dylannn', 'Roger Szmodis']
  const lorem = new LoremIpsum()

  const users = await Promise.all(userNames.map((name) => {
    return prisma.user.upsert({
      where: {
        email: `${name}@example.com`
      },
      update: {
        name
      },
      create: {
        email: `${name.toLowerCase().replaceAll(' ', '')}@example.com`,
        name,
        image: `https://picsum.photos/seed/${Math.random()}/200/200`
      }
    })
  }))

  const posts: Awaited<ReturnType<typeof prisma.post.create>>[] = []
  for (let i = 0; i < 100; i++) {
    for (const user of users) {
      await new Promise(resolve => setTimeout(resolve, 100))
      const newPost = await prisma.post.create({
        data: {
          content: `${posts.length} ${lorem.generateWords(15)}`,
          authorId: user.id
        }
      })
      posts.push(newPost)
    }
  }

  // for each user, select 20 random posts to like or dislike
  for (const user of users) {
    const randomPosts = posts.sort(() => Math.random() - 0.5).slice(0, 200)
    for (const post of randomPosts) {
      await prisma.reaction.upsert({
        where: {
          postId_userId: {
            userId: user.id,
            postId: post.id
          }
        },
        update: {},
        create: {
          type: (Math.random() > 0.5 ? 'LIKE' : 'DISLIKE'),
          userId: user.id,
          postId: post.id
        }
      })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
