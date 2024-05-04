import mongoose, {Schema, Document} from "mongoose"

export interface Message extends Document{
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content:{
        type: String,
        required: true
    }, 
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
    username:{
        type: String,
        required: [true, "please enter a username"],
        trim: true,
        unique: true
    }, 
    email: {
        type: String,
        required: [true, "please enter a email"],
        unique: true,
        match:[
            /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
            "please enter a valid email address"
        ]
    },
    password:{
        type: String,
        required: [true, "please enter a password"],
        match:[
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
            "please enter a valid password"
        ]
    },
    verifyCode:{
        type: String,
        required: [true, "please enter a verify code"]
    },
    verifyCodeExpiry:{
        type: Date,
        required: [true, "please enter a verify code expiry"]
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    isAcceptingMessage:{
        type: Boolean,
        default: true
    },
    messages:[
        MessageSchema
    ]
    
});

const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User", UserSchema);

export default UserModel;