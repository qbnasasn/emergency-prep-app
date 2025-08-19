"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Link, Unlink, CheckCircle, AlertCircle, Eye, EyeOff, ExternalLink } from "lucide-react"

interface StoreCredentials {
  amazon?: {
    accessKeyId: string
    secretAccessKey: string
    associateTag: string
    marketplaceId: string
  }
  walmart?: {
    clientId: string
    clientSecret: string
    channelType: string
  }
}

interface StoreIntegration {
  name: string
  connected: boolean
  credentials?: any
  lastSync?: string
  icon: string
}

export function StoreIntegrations() {
  const [integrations, setIntegrations] = useState<StoreIntegration[]>([
    {
      name: "Amazon",
      connected: false,
      icon: "🛒",
    },
    {
      name: "Walmart",
      connected: false,
      icon: "🏪",
    },
  ])

  const [credentials, setCredentials] = useState<StoreCredentials>({})
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [isConnecting, setIsConnecting] = useState<{ [key: string]: boolean }>({})

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleCredentialChange = (store: string, field: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [store.toLowerCase()]: {
        ...prev[store.toLowerCase() as keyof StoreCredentials],
        [field]: value,
      },
    }))
  }

  const connectStore = async (storeName: string) => {
    setIsConnecting((prev) => ({ ...prev, [storeName]: true }))

    // Simulate API call
    setTimeout(() => {
      setIntegrations(
        integrations.map((store) =>
          store.name === storeName
            ? {
                ...store,
                connected: true,
                lastSync: new Date().toISOString(),
                credentials: credentials[storeName.toLowerCase() as keyof StoreCredentials],
              }
            : store,
        ),
      )
      setIsConnecting((prev) => ({ ...prev, [storeName]: false }))
    }, 2000)
  }

  const disconnectStore = (storeName: string) => {
    setIntegrations(
      integrations.map((store) =>
        store.name === storeName ? { ...store, connected: false, credentials: undefined, lastSync: undefined } : store,
      ),
    )
    // Clear credentials from state
    setCredentials((prev) => ({
      ...prev,
      [storeName.toLowerCase()]: undefined,
    }))
  }

  const isFormValid = (storeName: string) => {
    const storeKey = storeName.toLowerCase() as keyof StoreCredentials
    const creds = credentials[storeKey]

    if (storeName === "Amazon") {
      return creds?.accessKeyId && creds?.secretAccessKey && creds?.associateTag && creds?.marketplaceId
    } else if (storeName === "Walmart") {
      return creds?.clientId && creds?.clientSecret && creds?.channelType
    }
    return false
  }

  const renderAmazonForm = (store: StoreIntegration) => {
    const creds = credentials.amazon || {}

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-body font-medium text-sm">Access Key ID *</Label>
            <Input
              placeholder="AKIA..."
              value={creds.accessKeyId || ""}
              onChange={(e) => handleCredentialChange("Amazon", "accessKeyId", e.target.value)}
              className="font-body text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body font-medium text-sm">Secret Access Key *</Label>
            <div className="relative">
              <Input
                type={showSecrets.amazonSecret ? "text" : "password"}
                placeholder="Enter secret key"
                value={creds.secretAccessKey || ""}
                onChange={(e) => handleCredentialChange("Amazon", "secretAccessKey", e.target.value)}
                className="font-body text-sm pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => toggleSecretVisibility("amazonSecret")}
              >
                {showSecrets.amazonSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-body font-medium text-sm">Associate Tag *</Label>
            <Input
              placeholder="your-associate-tag-20"
              value={creds.associateTag || ""}
              onChange={(e) => handleCredentialChange("Amazon", "associateTag", e.target.value)}
              className="font-body text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body font-medium text-sm">Marketplace ID *</Label>
            <Input
              placeholder="ATVPDKIKX0DER (US)"
              value={creds.marketplaceId || ""}
              onChange={(e) => handleCredentialChange("Amazon", "marketplaceId", e.target.value)}
              className="font-body text-sm"
            />
          </div>
        </div>
      </div>
    )
  }

  const renderWalmartForm = (store: StoreIntegration) => {
    const creds = credentials.walmart || {}

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-body font-medium text-sm">Client ID *</Label>
            <Input
              placeholder="Enter client ID"
              value={creds.clientId || ""}
              onChange={(e) => handleCredentialChange("Walmart", "clientId", e.target.value)}
              className="font-body text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body font-medium text-sm">Client Secret *</Label>
            <div className="relative">
              <Input
                type={showSecrets.walmartSecret ? "text" : "password"}
                placeholder="Enter client secret"
                value={creds.clientSecret || ""}
                onChange={(e) => handleCredentialChange("Walmart", "clientSecret", e.target.value)}
                className="font-body text-sm pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => toggleSecretVisibility("walmartSecret")}
              >
                {showSecrets.walmartSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium text-sm">Channel Type *</Label>
          <Input
            placeholder="e.g., MARKETPLACE"
            value={creds.channelType || ""}
            onChange={(e) => handleCredentialChange("Walmart", "channelType", e.target.value)}
            className="font-body text-sm"
          />
        </div>
      </div>
    )
  }

  const getInstructions = (storeName: string) => {
    if (storeName === "Amazon") {
      return {
        title: "Amazon Product Advertising API Setup:",
        steps: [
          "1. Visit Amazon Associates Program and create an account",
          "2. Go to Product Advertising API section",
          "3. Create Access Keys in your AWS account",
          "4. Note your Associate Tag from Associates dashboard",
          "5. Use marketplace ID: ATVPDKIKX0DER for US",
        ],
        link: "https://webservices.amazon.com/paapi5/documentation/",
      }
    } else {
      return {
        title: "Walmart Marketplace API Setup:",
        steps: [
          "1. Register as a Walmart Marketplace seller",
          "2. Visit Walmart Developer Portal",
          "3. Create a new application",
          "4. Generate Client ID and Client Secret",
          "5. Set Channel Type to MARKETPLACE",
        ],
        link: "https://developer.walmart.com/",
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2 text-blue-500" />
          Store API Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {integrations.map((store) => {
          const instructions = getInstructions(store.name)

          return (
            <div key={store.name} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{store.icon}</span>
                  <div>
                    <h3 className="font-body font-semibold text-gray-900 text-lg">{store.name} API</h3>
                    {store.connected && store.lastSync && (
                      <p className="font-body text-xs text-gray-500">
                        Connected: {new Date(store.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {store.connected ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>
              </div>

              {store.connected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-body text-sm text-green-800">
                      ✅ {store.name} API is successfully connected and ready for use.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectStore(store.name)}
                    className="font-body bg-transparent"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {store.name === "Amazon" && renderAmazonForm(store)}
                  {store.name === "Walmart" && renderWalmartForm(store)}

                  <Button
                    size="sm"
                    onClick={() => connectStore(store.name)}
                    disabled={!isFormValid(store.name) || isConnecting[store.name]}
                    className="font-body bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isConnecting[store.name] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Connect {store.name}
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-body text-sm font-semibold text-blue-900 mb-2">{instructions.title}</p>
                    <ul className="font-body text-xs text-blue-800 space-y-1">
                      {instructions.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 p-1"
                    onClick={() => window.open(instructions.link, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
