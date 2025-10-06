import { PrismaClient } from "@prisma/client";
import { NextAuthOptions, getServerSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const credentialsSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const result = credentialsSchema.safeParse(creds);
        if (!result.success) return null;
        const { emailOrUsername, password } = result.data;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
          },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.username } as {
          id: string;
          email: string;
          name: string;
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
};

export async function getSessionOnServer() {
  return getServerSession(authOptions);
}
