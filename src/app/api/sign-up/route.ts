import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect();

    try {
        const {username, email, password} = await request.json();
        const existingVerifiedUserByUsername = await UserModel.findOne({
            username,
            isVerified:true
        })

        console.log("here is the username:: " + username);
        console.log("here is the email:: " + email);
        console.log("here is the password:: " + password);
        
        if (existingVerifiedUserByUsername) {
            return Response.json({
                success: false,
                message: "user already exists"
            }, {status: 400})
        }

        const existingUserByEmail = await UserModel.findOne({email})

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: " user already exists with this email address",
                }, {status: 400})
            }else{
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

                await existingUserByEmail.save()
            }
        }else{
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 10);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })
            await newUser.save();
        }

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500})
        }
        
        return Response.json({
            success: true,
            message: "user registered successfully, please verify your email"
        }, {status: 200})

    } catch (error) {
        console.error("error registering user::", error);
        return Response.json({
            success: false,
            message: "error is registering user"
        }, {status: 500})
    }
};
