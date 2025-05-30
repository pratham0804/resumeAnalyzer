import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

Updated on 2025-05-16 10:30:45 - Change #5660

Updated on 2025-05-16 10:30:56 - Change #3742

Updated on 2025-05-16 10:31:03 - Change #1752

Updated on 2025-05-16 10:31:06 - Change #3611

Updated on 2025-05-16 10:31:10 - Change #1844

Updated on 2025-05-16 10:31:17 - Change #2605

Updated on 2025-05-16 10:31:18 - Change #1378
