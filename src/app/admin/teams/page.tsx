"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-semibold tracking-tight">
            Teams
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members and collaborators
          </p>
        </div>
        <Button className="cursor-target">
          <Users className="mr-2 h-4 w-4" />
          Invite Team Member
        </Button>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Teams Feature Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The teams management feature is currently under development. You'll
            soon be able to:
          </p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>• Invite team members to collaborate</li>
            <li>• Assign roles and permissions</li>
            <li>• Manage access to campaigns</li>
            <li>• Track team activity</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
