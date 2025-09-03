import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) => {
  return (
    <Card
      className={`cursor-target bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/70 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/20 ${className}`}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-3 rounded-full bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="font-headline text-xl font-semibold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default FeatureCard
