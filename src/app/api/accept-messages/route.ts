import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export async function POST(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "user not authenticated, please login or signup",
        }, {status: 401})
    }

    const userId = user?._id;
    const { acceptMessages } = await request.json();

    try{
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessage: acceptMessages},
            {new: true}
        )
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "failed to set accepting message or not",
            }, {status:401});
        }
        return Response.json({
            success: true,
            message: "messages accepted status update successfully",
            updatedUser
        }, {status:200});
    }catch(error){
        console.log("failed to set accepting message or not :: " + error);
        return Response.json({
            success: false,
            message: "failed to set accepting message or not",
        }, {status:500});
    }
}

export async function GET(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "user not authenticated, please login or signup",
        }, {status: 401})
    }

    const userId = user?._id;

    try {
        const foundUser = await UserModel.findById(userId)
    
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "user not found",
            }, {status:401});
        }
        return Response.json({
            success: true,
            isAcceptingMessages: true,
        }, {status:200});
    } catch (error) {
        console.log("error in getting accepting messages", error);
        return Response.json({
            success: false,
            message: "error in getting accepting messages",
        }, {status:500});
    }
}