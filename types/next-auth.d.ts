// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      theme: string
      themeColor: string
    } & DefaultSession["user"]
    sessionId: string
  }

  interface User {
    username: string
    theme: string
    themeColor: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string
    theme: string
    themeColor: string
    sessionId: string
  }
}