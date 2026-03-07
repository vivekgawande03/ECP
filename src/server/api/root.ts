import { configurationRouter } from "@/server/api/routers/configuration";
import { exampleRouter } from "@/server/api/routers/example";
import { quoteRouter } from "@/server/api/routers/quote";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  configuration: configurationRouter,
  example: exampleRouter,
  quote: quoteRouter,
});

export type AppRouter = typeof appRouter;