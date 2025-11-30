"use client"

import { SignIn, SignUp } from "@clerk/nextjs"

export function SignInForm({ defaultTab = "signin" }: { defaultTab?: "signin" | "signup" }) {
  if (defaultTab === "signup") {
    return (
      <div className="flex justify-center w-full">
         <SignUp />
      </div>
    )
  }
  return (
    <div className="flex justify-center w-full">
      <SignIn />
    </div>
  )
}
