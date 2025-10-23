import { SignInForm } from "@/components/auth/sign-in-form"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/images/LOGO.png" alt="PrepSafe Logo" width={160} height={213} className="h-48 w-auto" />
          </div>
          <p className="font-body text-gray-600 text-lg">Your Safety, Our Priority: Prepare for Tomorrow, Today!</p>
        </div>

        <SignInForm />


        <div className="mt-8 text-center">
          <p className="font-body text-sm text-gray-500">
            Emergency preparedness made simple for individuals, families, and preppers.
          </p>
        </div>
      </div>
    </div>
  )
}
