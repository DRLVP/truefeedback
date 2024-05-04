"use client"
import { useForm } from 'react-hook-form';
import * as z from "zod";
import { zodResolver} from "@hookform/resolvers/zod";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation';
import { signupSchema } from '@/schemas/signup.schema';
import axios, { AxiosError } from "axios";
import { ApiResponse } from '@/types/ApiResponse';
import { Form, FormField, FormItem, FormLabel, FormDescription, FormMessage, FormControl } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
function page() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedUsername = useDebounceCallback(setUsername, 400);
  const {toast} = useToast();
  const router = useRouter();

  // zod implements
  const form = useForm<z.infer <typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues:{
      username: "",
      email: "",
      password: ""
    }
  })

  useEffect(() =>{
    const checkUsernameUnique = async () =>{
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");

        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`);
          console.log("get my check-username response", response);
          
          setUsernameMessage(response.data.message);

        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "error checking username"
          )
        } finally {
          setIsCheckingUsername(false);
        }
      }
    }

    checkUsernameUnique();
  },[ username]);

  const onSubmit = async (data: z.infer <typeof signupSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/signup", data);
      console.log("post my signup response", response);
      toast({
        title: "signup success",
        description: response.data.message,
      })
      router.replace(`/verify/${username}`)
      setIsSubmitting(false);
    } catch (error:any) {
      console.error("error ase signup pageot:: " + error.message);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      toast({
        title: "signup failed",
        description: errorMessage,
        variant:"destructive"
      })
      setIsSubmitting(false);
    }
  }
  return (
    <section className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username"
                {...field} 
                onChange={(e)=>{
                  field.onChange(e);
                  debouncedUsername(e.target.value);
                }
                }
                />
              </FormControl>
                {
                  isCheckingUsername && <Loader className="animate-spin"/>
                }
                <p className={`${usernameMessage === "username is avalible"? "text-green-500" : "text-red-500"}`}>
                  {usernameMessage}
                </p>
              <FormMessage />
            </FormItem>
            )}
          />
          <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email"
                {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
          />
          <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password"
                {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {
              isSubmitting? (
                <>
                  <Loader className='animate-spin h-4 w-4'/> please wait...
                </>
              ): "signup"
            }
          </Button>
          </form>
        </Form>
        <div>
          <p>already have an account {" "}
            <Link href="/sign-in">
              signin
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default page;