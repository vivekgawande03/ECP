import { z } from "zod";
import {
  configurationEvaluationSchema,
  configurationSchema,
} from "@/lib/configurator/schemas";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { evaluateConfiguration } from "@/server/services/configuration-evaluator";

export const configurationRouter = createTRPCRouter({
  evaluate: publicProcedure
    .input(
      z.object({
        configuration: configurationSchema,
      }),
    )
    .output(configurationEvaluationSchema)
    .query(({ input }) => evaluateConfiguration(input.configuration)),
});