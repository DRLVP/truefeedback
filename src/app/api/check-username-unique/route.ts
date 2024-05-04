import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import {z} from "zod";
import { usernameValidation } from "@/schemas/signup.schema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET(request: Request){
    if (request.method !== "GET") {
        return Response.json({
            success: false, 
            message: "check you method: only GET method is supported",
        }, {status: 405});
    }
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username : searchParams.get("username")
        }

        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParams);
        console.log("this is the result from CUN route::" + result.data);
        
        if (!result.success) {
            const usernameError = result.error.format().username?._errors || [];
            return Response.json({
                success: false, 
                message: usernameError?.length > 0 ? usernameError :"invalid username, please try again"
            }, {status: 400}
            );
        }

        const {username} = result.data;

        const existingVerifiedUser = await UserModel.findOne({username, isVerified:true})

        if (existingVerifiedUser) {
            return Response.json({
                success: false, 
                message: "username is already taken",
            }, {status: 400});
        }else{
            return Response.json({
                success: true, 
                message: "username is avalible",
            }, {status: 200});

        }
    } catch (error) {
        console.log("error in checking username", error);
        return Response.json({success: false}, {status: 500});
    }
}