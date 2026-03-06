import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  greeting: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
      }),
    )
    .query(({ input }) => {
      const name = input.name?.trim() || "World";

      return {
        message: `Hello, ${name}! Your tRPC endpoint is working.`,
      };
    }),
});