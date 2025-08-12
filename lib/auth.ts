import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { JWT } from "next-auth/jwt"

// ใช้ Prisma Client ที่เราสร้างเป็น Singleton (ถ้ามี)
// import prisma from "@/lib/prisma";
const prisma = new PrismaClient();


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          })

          if (!user) {
            return null
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password)
          
          if (!passwordMatch) {
            return null
          }

          await prisma.userSession.updateMany({
            where: { 
              userId: user.id,
              isActive: true
            },
            data: { isActive: false }
          })

          // --- จุดแก้ไข ---
          // ใช้ ?? เพื่อกำหนดค่า default ในกรณีที่ค่าจาก db เป็น null
          return {
            id: user.id.toString(),
            username: user.username,
            theme: user.theme ?? 'light',
            themeColor: user.themeColor ?? 'blue',
            image: user.image ?? '', // ให้เป็น string ว่างถ้าไม่มีรูป
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.username = user.username
        token.theme = user.theme
        token.themeColor = user.themeColor
        token.image = user.image
        
        const sessionId = uuidv4()
        token.sessionId = sessionId
        
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        
        await prisma.userSession.create({
          data: {
            id: sessionId,
            userId: parseInt(user.id),
            expires: expiresAt,
            isActive: true
          }
        })
      }
      
      if (trigger === "update" && session) {
        token.theme = session.theme
        token.themeColor = session.themeColor
        token.image = session.image
      }
      
      if (token.sessionId) {
        const userSession = await prisma.userSession.findUnique({
          where: { id: token.sessionId as string }
        })
        
        if (!userSession || !userSession.isActive || userSession.expires < new Date()) {
          throw new Error("Session is invalid");
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username as string
        session.user.theme = token.theme as string
        session.user.themeColor = token.themeColor as string
        session.user.image = token.image as string
        session.sessionId = token.sessionId as string
      }
      return session
    }
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  
  pages: {
    signIn: "/login",
  },
  
  events: {
    async signOut({ token }) {
      if (token?.sessionId) {
        await prisma.userSession.update({
          where: { id: token.sessionId as string },
          data: { isActive: false }
        })
      }
    }
  }
}