import Link from "next/link"
import Image from "next/image"
import { TriangleAlert, ChevronLeft, Shield, MapPin, Camera, UserX } from "lucide-react"
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

        {/* Privacy Policy - REWRITTEN FOR GOOGLE PLAY COMPLIANCE */}
        <section id="privacy">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-slate-700" />
                <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none text-slate-600">
              <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>

              <p>
                This Privacy Policy describes how PrepSafe ("we", "us", or "our") collects, uses, and discloses your information when you use our website and mobile application (the "Service").
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-6">1. Information We Collect</h3>
              
              <h4 className="font-bold text-slate-800 mt-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location Data (Android & iOS)
              </h4>
              <p>
                Our mobile application requests access to your device's location (Fine and Coarse Location permissions). 
                <strong> How we use this data:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>To display your current position on the emergency map.</li>
                <li>To calculate evacuation routes and distances to safety points.</li>
                <li>To provide localized emergency alerts (NOAA/Weather).</li>
              </ul>
              <p className="text-sm italic mt-2">
                This data is used in the foreground (while you are using the app). We share location data with Google Maps Platform API solely to render maps and generate routing directions. We do not sell your location history to third parties.
              </p>

              <h4 className="font-bold text-slate-800 mt-4 flex items-center gap-2">
                <Camera className="h-4 w-4" /> Camera Access
              </h4>
              <p>
                Our app requests camera permissions to enable the Barcode Scanner feature. 
                <strong> How we use this data:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>To scan UPC/EAN codes on food and medical supplies for quick inventory entry.</li>
              </ul>
              <p className="text-sm italic mt-2">
                Video data is processed locally on your device to recognize codes. We do not record, save, or transmit video feeds to our servers.
              </p>

              <h4 className="font-bold text-slate-800 mt-4">Personal & Family Data</h4>
              <p>
                We collect information you voluntarily provide, including:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Information:</strong> Name, email address, and authentication credentials (via our auth provider).</li>
                <li><strong>Emergency Data:</strong> Names of family members, pet details, and inventory lists you create.</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-900 mt-6">2. Third-Party Services</h3>
              <p>We use trusted third-party services to operate our app. These partners may handle data as follows:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Google Maps Platform:</strong> Used for map display and routing logic. Subject to Google's Privacy Policy.</li>
                <li><strong>Clerk / Auth Provider:</strong> Used for secure user authentication and identity management.</li>
                <li><strong>Hosting Services:</strong> Our database and API are hosted on secure cloud infrastructure.</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-900 mt-6 flex items-center gap-2">
                <UserX className="h-5 w-5" /> 3. Data Retention & Deletion
              </h3>
              <p>
                We retain your personal data only as long as your account is active.
              </p>
              <p className="mt-2 font-semibold">How to Delete Your Data:</p>
              <p>
                You have the right to request the complete deletion of your account and all associated data (inventory, family lists, plans) at any time.
              </p>
              <ol className="list-decimal pl-5 space-y-1 mt-2">
                <li><strong>In-App:</strong> Go to Settings &gt; Account &gt; Delete Account.</li>
                <li><strong>Web Request:</strong> Email us at <a href="mailto:support@prepsafe.app" className="text-blue-600 hover:underline">support@prepsafe.app</a> with the subject "Data Deletion Request".</li>
              </ol>
              <p className="mt-2">
                Upon request, we will permanently remove your data from our active databases within 30 days.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-6">4. Data Security</h3>
              <p>
                We implement industry-standard security measures (HTTPS encryption, secure database access) to protect your data. However, no method of transmission over the Internet is 100% secure.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mt-6">5. Contact Us</h3>
              <p>
                If you have questions about this policy or our privacy practices, please contact us at: <br/>
                <a href="mailto:support@prepsafe.app" className="text-blue-600 hover:underline">support@prepsafe.app</a>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Terms of Service */}
        <section id="terms">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none text-slate-600">
              <p>Last Updated: {new Date().toLocaleDateString()}</p>
              
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing and using PrepSafe ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>

              <h3>2. Use of Service</h3>
              <p>
                PrepSafe provides tools for personal inventory management and emergency planning. You agree to use the Service only for lawful purposes. You are responsible for ensuring your emergency plans are suitable for your specific needs.
              </p>

              <h3>3. User Accounts</h3>
              <p>
                You are responsible for safeguarding your account credentials. You notify us immediately of any unauthorized use of your account.
              </p>

              <h3>4. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, PrepSafe shall not be liable for any indirect, incidental, special, consequential damages, or any loss of data resulting from your use of the Service. 
                <strong> The Service is provided "AS IS" without warranties of any kind regarding the accuracy of maps, routes, or survival information.</strong>
              </p>

              <h3>5. Termination</h3>
              <p>
                We may terminate or suspend access to our Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties, or for any other reason.
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
