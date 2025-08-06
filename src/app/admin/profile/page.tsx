import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold tracking-tight">
        User Profile
      </h1>
      <p className="text-muted-foreground">
        Manage your account and personal information.
      </p>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <User className="mr-2 h-6 w-6 text-primary" />
            Profile Details
          </CardTitle>
          <CardDescription>
            Update your public profile information here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src="https://placehold.co/96x96.png"
                alt="User Avatar"
                data-ai-hint="person avatar"
              />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline">Change Avatar</Button>
              <p className="text-xs text-muted-foreground">
                JPG, GIF or PNG. 1MB max.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                defaultValue="Admin User"
                className="bg-background/50 border-border/70 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue="admin@adtivity.com"
                disabled
                className="bg-background/50 border-border/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                defaultValue="admin_user"
                className="bg-background/50 border-border/70 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                defaultValue="Administrator"
                disabled
                className="bg-background/50 border-border/70"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-lg">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
