import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SignInForm } from "@/components/auth/sign-in-form"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ShieldCheck,
  Zap,
  Map as MapIcon,
  Package,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Radio,
  Users,
  Check
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto max-w-7xl">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/LOGO.png" alt="PrepSafe" width={32} height={32} className="h-8 w-auto" />
            <span className="text-xl font-bold font-heading tracking-tight text-slate-900">PrepSafe</span>
          </Link>

          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#news" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              News
            </Link>
            <Link href="#support" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Support
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="font-heading font-semibold bg-slate-900 text-white hover:bg-slate-800">Sign In</Button>
              </DialogTrigger>
              <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
                <SignInForm defaultTab="signup" />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 opacity-20">
             <div className="absolute inset-0 bg-[url('/images/hero-background.jpg')] bg-cover bg-center" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          </div>

          <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-7xl text-center">
            <div className="inline-flex items-center rounded-full border border-yellow-500/50 bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-500 mb-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Disasters Don't Wait. Neither Should You.
            </div>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              When the Grid Goes Down,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">
                Will You Be Ready?
              </span>
            </h1>
            <p className="font-body text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Hope is not a strategy. PrepSafe gives you the military-grade organization tools you need to
              track supplies, coordinate family, and survive the unexpected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 text-lg h-12 rounded-full">
                    Start Preparing Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
                  <SignInForm />
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="lg" className="text-white border-slate-600 hover:bg-white/10 h-12 px-8 bg-transparent rounded-full">
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* The Reality Check (Fear Factor) */}
        <section className="py-20 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900">
                  The Odds Are Not in Your Favor
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  We live in an increasingly unpredictable world. Severe weather events, power grid failures, and supply chain disruptions are becoming the new normal.
                </p>
                <ul className="space-y-4">
                  {[
                    "60% of Americans have no emergency plan.",
                    "Grocery stores run out of food in 3 days during a crisis.",
                    "Power outages have doubled in the last decade."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-red-100 p-1">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="font-medium text-slate-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-slate-800 border border-slate-700">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6 animate-pulse">
                            <Radio className="h-10 w-10 text-red-500" />
                        </div>
                        <h3 className="text-white font-bold text-2xl mb-2">System Status: <span className="text-red-500">VULNERABLE</span></h3>
                        <p className="text-slate-400 mt-2 max-w-xs mx-auto">Without a centralized plan, chaos reigns during an emergency. Take control today.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-slate-900">Your Digital Bug-Out Bag</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                PrepSafe isn't just a checklist. It's a comprehensive survival management system designed for the modern prepper.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-xl transition-all hover:border-primary/50">
                <div className="mb-4 inline-block rounded-lg bg-slate-100 p-3 group-hover:bg-primary/10 transition-colors">
                  <Package className="h-8 w-8 text-slate-700 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-slate-900">Smart Inventory</h3>
                <p className="text-slate-600">
                  Track calorie counts, expiration dates, and water supplies automatically. Know exactly how many days you can survive.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-xl transition-all hover:border-blue-500/50">
                <div className="mb-4 inline-block rounded-lg bg-slate-100 p-3 group-hover:bg-blue-100 transition-colors">
                  <MapIcon className="h-8 w-8 text-slate-700 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-slate-900">Tactical Mapping</h3>
                <p className="text-slate-600">
                  Plot rally points, evacuation routes, and emergency caches. Visualize critical locations instantly.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-xl transition-all hover:border-green-500/50">
                <div className="mb-4 inline-block rounded-lg bg-slate-100 p-3 group-hover:bg-green-100 transition-colors">
                  <Users className="h-8 w-8 text-slate-700 group-hover:text-green-600 transition-colors" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-slate-900">Family Sync</h3>
                <p className="text-slate-600">
                  Keep your entire household on the same page. Assign roles, share plans, and ensure everyone knows the drill.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-xl transition-all hover:border-yellow-500/50">
                <div className="mb-4 inline-block rounded-lg bg-slate-100 p-3 group-hover:bg-yellow-100 transition-colors">
                  <Zap className="h-8 w-8 text-slate-700 group-hover:text-yellow-600 transition-colors" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-slate-900">Real-Time Alerts</h3>
                <p className="text-slate-600">
                  Integrated NOAA weather alerts and RSS feeds keep you informed of incoming threats before they hit.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-xl transition-all hover:border-purple-500/50">
                <div className="mb-4 inline-block rounded-lg bg-slate-100 p-3 group-hover:bg-purple-100 transition-colors">
                  <ShieldCheck className="h-8 w-8 text-slate-700 group-hover:text-purple-600 transition-colors" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-slate-900">Secure Storage</h3>
                <p className="text-slate-600">
                  Keep your critical information safe and accessible when you need it most.
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-xl transition-all hover:border-red-500/50">
                <div className="mb-4 inline-block rounded-lg bg-slate-100 p-3 group-hover:bg-red-100 transition-colors">
                  <Radio className="h-8 w-8 text-slate-700 group-hover:text-red-600 transition-colors" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2 text-slate-900">Comms Center</h3>
                <p className="text-slate-600">
                  Reference guides for Ham radio frequencies, GMRS channels, and emergency broadcast monitoring tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-slate-900">Simple, Transparent Pricing</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Start your preparedness journey for free. Upgrade for total peace of mind.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Basic Scout (Free Tier) */}
              <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 font-heading">Basic Scout</h3>
                  <div className="mt-4 flex items-baseline text-slate-900">
                    <span className="text-5xl font-extrabold tracking-tight">$0</span>
                    <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                  </div>
                  <p className="mt-4 text-slate-600">Essential tools for individual preparedness.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>Inventory Management</strong> (Up to 50 items)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>Kit Builder</strong> (Basic Templates)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>Automated Shopping List</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>Weather Alerts</strong> (Local NOAA Feeds)</span>
                  </li>
                </ul>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-12 font-semibold border-slate-300 hover:bg-slate-50 text-slate-700 mt-auto">
                      Start for Free
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
                    <SignInForm />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Prepper Pro (Paid Tier) */}
              <div className="relative rounded-2xl border-2 border-primary bg-white p-8 shadow-xl transform md:-translate-y-4 flex flex-col z-10">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  POPULAR
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 font-heading">Prepper Pro</h3>
                  <div className="mt-4 flex items-baseline text-slate-900">
                    <span className="text-5xl font-extrabold tracking-tight">$5</span>
                    <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                  </div>
                  <p className="mt-4 text-slate-600">Advanced tools for serious preppers.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" />
                    <span className="text-slate-700 font-semibold">Everything in Basic, plus:</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>Unlimited Inventory & Kits</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>Food Rationing Calculator</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>Advanced Comms Center</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>PDF Plan Exports</strong></span>
                  </li>
                </ul>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg mt-auto">
                      Get Pro Access
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
                    <SignInForm />
                  </DialogContent>
                </Dialog>
              </div>

               {/* Family Plan */}
               <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 font-heading">Family Plan</h3>
                  <div className="mt-4 flex items-baseline text-slate-900">
                    <span className="text-5xl font-extrabold tracking-tight">$10</span>
                    <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                  </div>
                  <p className="mt-4 text-slate-600">Complete protection for your household.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" />
                    <span className="text-slate-700 font-semibold">Everything in Prepper Pro, plus:</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>Family Sync</strong> (4 Family Members)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>Shared Emergency Plans</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 shrink-0" />
                    <span className="text-slate-700"><strong>Real-time Location Sharing</strong></span>
                  </li>
                </ul>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12 font-semibold bg-blue-600 hover:bg-blue-700 text-white mt-auto">
                      Get Family Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
                    <SignInForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="mt-16 text-center">
                <h4 className="font-semibold text-slate-900 mb-6">Included in All Plans</h4>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-slate-600">
                    <span className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Mobile Friendly</span>
                    <span className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> SSL Encryption</span>
                    <span className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Community Support</span>
                    <span className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Regular Updates</span>
                </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/images/LOGO.png" alt="PrepSafe" width={24} height={24} className="h-6 w-auto grayscale opacity-80" />
                <span className="font-bold text-lg text-slate-700">PrepSafe</span>
              </div>
              <p className="text-slate-500 text-sm">
                The ultimate emergency preparedness platform for individuals and families. Be ready for anything.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-slate-900">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-primary">Survival Guide</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Community</Link></li>
                <li><Link href="#" className="hover:text-primary">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} PrepSafe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
