import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import mongoose from "mongoose";

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

    const userId = new mongoose.Types.ObjectId(user?._id);

    try {
        const user = await UserModel.aggregate([
            {$match: {id: userId}},
            {$unwind: "$messages"},
            {$sort: {"$messages.createdAt":-1}},
            {$group:{_id:"$_id", messages:{$push:"$messages"}}}
        ])

        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "user not found",
            }, {status: 401})
        }
        return Response.json({
            success: true,
            message: user[0].messages,
        }, {status: 200})
    } catch (error) {
        console.log("error in getting message::", error);
        return Response.json({
            success: false,
            message: "error getting message::",
        }, {status: 500})
    }
}