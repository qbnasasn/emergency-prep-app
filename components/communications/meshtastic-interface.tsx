"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, ExternalLink, Radio } from "lucide-react"

export function MeshtasticInterface() {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Wifi className="h-6 w-6 text-primary" />
          </div>
          <div>
             <h3 className="font-heading font-semibold text-lg">Meshtastic Network</h3>
             <p className="text-sm text-muted-foreground font-body">
               Manage nodes and messages via the web client.
             </p>
          </div>
        </div>

        <Button
            className="font-body w-full sm:w-auto"
            onClick={() => window.open("https://client.meshtastic.org", "_blank")}
          >
            Launch Web Client <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
