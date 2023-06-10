import { router } from '../trpc'
import { postRouter } from './post'
import { myRouter } from './my'
import { userRouter } from './user'

export const appRouter = router({
  post: postRouter,
  my: myRouter,
  user: userRouter
})

// export type definition of API
export type AppRouter = typeof appRouter;
