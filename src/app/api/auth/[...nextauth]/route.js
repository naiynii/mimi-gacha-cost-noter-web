import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: "identify" } },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const allowedUserId = process.env.ALLOWED_USER_ID;
      // If ALLOWED_USER_ID is not configured, reject all for safety
      if (!allowedUserId) {
        console.error("Access blocked: ALLOWED_USER_ID environment variable is not defined.");
        return false;
      }
      
      if (user.id !== allowedUserId) {
        console.warn(`Access blocked: Discord user ${user.name} (${user.id}) tried to log in, but is not the owner.`);
        return false;
      }
      
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
