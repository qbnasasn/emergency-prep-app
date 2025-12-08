import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl px-4">
      <h1 className="text-3xl font-bold mb-6">Legal & Liability</h1>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Medical & Emergency Liability Disclaimer</AlertTitle>
        <AlertDescription>
          PrepSafe is for organizational purposes only. We are not medical professionals or emergency response experts.
          Information provided in this application should not be taken as professional medical or survival advice.
          Always consult with qualified professionals for medical needs and emergency planning.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground">Effective Date: October 26, 2023</p>
          <p>
            Welcome to PrepSafe. By accessing or using our application, you agree to be bound by these Terms of Service.
            If you disagree with any part of the terms, you may not access the service.
          </p>
          <h3 className="font-semibold text-foreground mt-4">1. Acceptance of Terms</h3>
          <p>
            By creating an account or using PrepSafe, you acknowledge that you have read, understood, and agree to these terms.
          </p>
          <h3 className="font-semibold text-foreground mt-4">2. Use License</h3>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on PrepSafe&apos;s website for personal, non-commercial transitory viewing only.
          </p>
           <h3 className="font-semibold text-foreground mt-4">3. Disclaimer</h3>
          <p>
            The materials on PrepSafe&apos;s website are provided on an &apos;as is&apos; basis. PrepSafe makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground">Effective Date: October 26, 2023</p>
          <p>
            Your privacy is important to us. It is PrepSafe&apos;s policy to respect your privacy regarding any information we may collect from you across our website.
          </p>
          <h3 className="font-semibold text-foreground mt-4">1. Information We Collect</h3>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.
          </p>
          <h3 className="font-semibold text-foreground mt-4">2. How We Store Data</h3>
          <p>
            We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we&apos;ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
