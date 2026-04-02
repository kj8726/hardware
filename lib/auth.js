import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }
        await connectDB();
        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user || !user.password) throw new Error("No account found with this email");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Incorrect password");
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
          isNewUser: false,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            name: user.name,
            email: user.email,
            avatar: user.image,
            provider: "google",
            role: "customer",
          });
          // Flag as new so we redirect to onboarding
          user.isNewUser = true;
        } else {
          user.isNewUser = false;
          user.role = existing.role;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Handle session update (called after update())
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isNewUser = user.isNewUser;
      } else if (token.email && !token.id) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isNewUser = token.isNewUser;
      }
      return session;
    },

    async redirect({ url, baseUrl, token }) {
      // Send new Google users to onboarding
      if (token?.isNewUser) {
        return `${baseUrl}/onboarding`;
      }
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/onboarding",
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
