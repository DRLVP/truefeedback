import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import UserModel from "@/model/User.model";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials:{
                email: { label: "email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials:any, req): Promise<any>{
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or:[
                            {email: credentials.identifier},
                            {username: credentials.identifier}
                        ]
                    })

                    if (!user) {
                        throw new Error("no user found with this email address")
                    }
                    if (!user.isVerified) {
                        throw new Error("please verify your account before login")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if (isPasswordCorrect) {
                        return user;
                    }else{
                        throw new Error("password is incorrect")
                    }
                } catch (error:any) {
                    throw new Error(error)
                }
            }
            
        })
    ],
    pages:{
        signIn:"/sign-in",
    },
    session:{
        strategy:"jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks:{
        async session({ session,  token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;

            }
            return session
          },
          async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessage = user.isAcceptingMessage;
                token.username = user.username;
            }
            return token
        }
    }
}