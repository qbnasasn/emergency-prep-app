'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound } from 'lucide-react'

export function ChangePasswordForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center">
          <KeyRound className="h-5 w-5 mr-2 text-primary" />
          Change Password
        </CardTitle>
        <CardDescription>
          Password management is now handled by our secure authentication provider.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4 font-body">
            Click on your profile avatar in the header and select "Manage Account" to change your password and security settings.
        </p>
      </CardContent>
    </Card>
  )
}
