// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

const prisma = new PrismaClient()

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
            await prisma.loginLog.create({
              data: {
                userId: user.id,
                ipAddress: req.headers?.["x-forwarded-for"] as string || "unknown",
                userAgent: req.headers?.["user-agent"] as string || "unknown",
                status: "failed"
              }
            })
            return null
          }

          await prisma.userSession.updateMany({
            where: { 
              userId: user.id,
              isActive: true
            },
            data: { isActive: false }
          })

          await prisma.loginLog.create({
            data: {
              userId: user.id,
              ipAddress: req.headers?.["x-forwarded-for"] as string || "unknown",
              userAgent: req.headers?.["user-agent"] as string || "unknown",
              status: "success"
            }
          })

          return {
            id: user.id.toString(),
            username: user.username,
            theme: user.theme,
            themeColor: user.themeColor
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
      // ทำงานครั้งแรกตอน Login
      if (user) {
        token.username = user.username
        token.theme = user.theme
        token.themeColor = user.themeColor
        
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
      
      // =======================================================
      // ===== จุดแก้ไขสำคัญอยู่ตรงนี้ครับ =====
      // =======================================================
      // ทำงานเมื่อมีการเรียกใช้ฟังก์ชัน update() จากฝั่ง client
      if (trigger === "update" && session) {
        // นำข้อมูลใหม่จาก session (ที่เราส่งมาจากหน้า settings)
        // มาอัปเดตใส่ใน token
        token.theme = session.theme
        token.themeColor = session.themeColor
      }
      
      // ตรวจสอบเซสชั่น (เหมือนเดิม)
      if (token.sessionId) {
        const userSession = await prisma.userSession.findUnique({
          where: { id: token.sessionId as string }
        })
        
        if (!userSession || !userSession.isActive || userSession.expires < new Date()) {
          return null
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      // session จะถูกสร้างขึ้นจาก token ที่อัปเดตใหม่แล้ว
      if (token) {
        session.user.id = token.sub!
        session.user.username = token.username as string
        session.user.theme = token.theme as string
        session.user.themeColor = token.themeColor as string
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
    signUp: "/register"
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