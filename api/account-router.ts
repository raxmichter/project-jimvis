import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { updateUserName } from "./queries/users";

export const accountRouter = createRouter({
  updateName: authedQuery.input(z.object({ name: z.string().trim().min(2, "Enter at least two characters.").max(60) })).mutation(async ({ ctx, input }) => {
    await updateUserName(ctx.user.id, input.name);
    return { ...ctx.user, name: input.name };
  }),
});
