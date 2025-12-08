import Link from "next/link"
import Image from "next/image"
import { TriangleAlert, ChevronLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function LegalPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto max-w-7xl">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/LOGO.png"
              alt="PrepSafe"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold font-heading tracking-tight text-slate-900">
              PrepSafe
            </span>
          </Link>

          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container px-4 md:px-6 mx-auto max-w-4xl py-12 space-y-8">

        {/* Medical & Emergency Liability Disclaimer */}
        <section>
          <Alert variant="destructive" className="border-red-600 bg-red-50 text-red-900 [&>svg]:text-red-600">
            <TriangleAlert className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold mb-2">Medical & Emergency Liability Disclaimer</AlertTitle>
            <AlertDescription className="text-base text-red-800/90 leading-relaxed">
              <p className="font-semibold mb-2">
                PrepSafe is strictly an organizational tool. It is NOT intended for life-critical decision-making.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>
                  <strong>Not Medical Advice:</strong> Any information regarding medical supplies, first aid, or health tracking is for inventory purposes only. Always consult a qualified medical professional for health advice.
                </li>
                <li>
                  <strong>Emergency Situations:</strong> Do not rely solely on this application during active emergencies. Always follow official instructions from local authorities and emergency services (911).
                </li>
                <li>
                  <strong>Data Availability:</strong> We cannot guarantee access to your data during power outages, network failures, or server downtime. Always maintain physical backup copies of critical emergency plans.
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </section>

        {/* Terms of Service */}
        <section id="terms">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none text-slate-600">
              <p>Last Updated: October 26, 2023</p>

              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing and using PrepSafe ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>

              <h3>2. Use of Service</h3>
              <p>
                PrepSafe provides tools for personal inventory management and emergency planning. You agree to use the Service only for lawful purposes and in accordance with these Terms.
              </p>

              <h3>3. User Accounts</h3>
              <p>
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. We encourage you to use "strong" passwords (passwords that use a combination of upper and lower case letters, numbers and symbols).
              </p>

              <h3>4. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, PrepSafe shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>

              <h3>5. Termination</h3>
              <p>
                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Privacy Policy */}
        <section id="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none text-slate-600">
              <p>Last Updated: October 26, 2023</p>

              <h3>1. Information We Collect</h3>
              <p>
                We collect information you provide directly to us, such as when you create an account, update your inventory, or contact support. This may include your name, email address, and the details of your emergency supplies.
              </p>

              <h3>2. How We Use Your Information</h3>
              <p>
                We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to monitor and analyze trends and usage.
              </p>

              <h3>3. Data Security</h3>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no internet or email transmission is ever fully secure or error free.
              </p>

              <h3>4. Cookies</h3>
              <p>
                We use cookies and similar technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>

              <h3>5. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us at support@prepsafe.app.
              </p>
            </CardContent>
          </Card>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="container px-4 mx-auto text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} PrepSafe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
