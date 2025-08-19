import { SignInForm } from "@/components/auth/sign-in-form"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image src="/images/safeprep-logo.png" alt="SafePrep Logo" width={120} height={120} className="w-24 h-24" />
          </div>
          <h1 className="font-heading font-black text-3xl text-gray-900 mb-2">SafePrep</h1>
          <p className="font-body text-gray-600 text-lg">Your Safety, Our Priority: Prepare for Tomorrow, Today!</p>
        </div>

        <SignInForm />

        <div className="mt-6 text-center">
          <Button asChild variant="outline" className="w-full font-body bg-transparent">
            <a href="/dashboard">View Dashboard Demo</a>
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="font-body text-sm text-gray-500">
            Emergency preparedness made simple for individuals, families, and preppers.
          </p>
        </div>
      </div>
    </div>
  )
}
