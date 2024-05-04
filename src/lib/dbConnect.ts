import mongoose from "mongoose";
import { string } from "zod";


type ConnectionObject = {
    isConnected?: number
}

const connection : ConnectionObject = {};


async function dbConnect(): Promise<void>{
    if (connection.isConnected) {
        console.log("database is already connected hoi ase");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.DB_URL || "", {});
        console.log("database is connected::" +db);

        connection.isConnected = db.connections[0].readyState;

        console.log("database is connected successfully hoi gol::" + connection.isConnected);
    } catch (error) {
        console.log("database is not connected huwa nai::", error);
        process.exit(1);
    }
}

export default dbConnect;