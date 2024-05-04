import OpenAI from "openai";
import { StreamingTextResponse, OpenAIStream } from "ai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = "edge";

export async function POST(request: Request){
    try {
        const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
    
        const response = await openai.completions.create({
            model: "gpt-3.5-turbo",
            stream: true,
            prompt
        })
        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (error) {
        if ( error instanceof OpenAI.APIError) {
            const {name, status, stack, headers, message, request_id} = error;
            return NextResponse.json({
                name,
                stack,
                status,
                headers,
                message,
                request_id
            }, {status})
        }else{
            console.error("an unexpected error occurred! ", error);
            throw error;
        }
    }
}