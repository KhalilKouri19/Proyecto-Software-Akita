import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const [rows]: any = await db.query(
          "SELECT * FROM Usuario WHERE Usuario = ? LIMIT 1",
          [credentials.username]
        );

        const user = rows[0];
        if (!user) return null;

        const validPassword = await bcrypt.compare(
          credentials.password,
          user.Contraseña
        );
        if (!validPassword) return null;

        return {
          id: user.ID_Usuario,
          name: user.Nombre,
          email: user.Email,
          role: user.Rol?.trim().toLowerCase() || "cliente",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // 👈 asegúrate de tener esto
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
