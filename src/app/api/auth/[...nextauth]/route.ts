import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // call your backend login endpoint
        const res = await fetch(`${process.env.API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        })

        if (!res.ok) return null
        const data = await res.json()

        // return what will be saved in the JWT
        return {
          id: data.user.id,
          email: data.user.email,
          token: data.access_token,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.accessToken = (user as any).token
      return token
    },
    async session({ session, token }) {
      ;(session as any).accessToken = token.accessToken
      return session
    },
  },
})

export { handler as GET, handler as POST }
