import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreditCard, Download, Star } from "lucide-react"

const billingHistory = [
  {
    invoice: "INV-2024-005",
    date: "May 1, 2024",
    amount: "$99.00",
    status: "Paid",
  },
  {
    invoice: "INV-2024-004",
    date: "April 1, 2024",
    amount: "$99.00",
    status: "Paid",
  },
  {
    invoice: "INV-2024-003",
    date: "March 1, 2024",
    amount: "$99.00",
    status: "Paid",
  },
]

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold tracking-tight">
        Billing & Subscriptions
      </h1>
      <p className="text-muted-foreground">
        Manage your subscription plan, payment methods, and view billing
        history.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <Star className="mr-2 h-6 w-6 text-yellow-400" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 via-background to-accent/20 border border-primary/50">
              <h3 className="text-2xl font-bold text-accent">
                Professional Plan
              </h3>
              <p className="text-4xl font-headline font-bold mt-2">
                $99
                <span className="text-lg font-normal text-muted-foreground">
                  /month
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your plan renews on June 1, 2024.
              </p>
            </div>
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10"
              >
                Change Plan
              </Button>
              <Button variant="destructive">Cancel Subscription</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <CreditCard className="mr-2 h-6 w-6 text-primary" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-background/50 border flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-muted-foreground mr-4" />
                <div>
                  <p className="font-medium">Visa ending in 1234</p>
                  <p className="text-sm text-muted-foreground">
                    Expires 12/2026
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <Button variant="outline" className="w-full">
              Add New Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Billing History
          </CardTitle>
          <CardDescription>
            View and download your past invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => (
                <TableRow key={item.invoice}>
                  <TableCell className="font-medium">{item.invoice}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-900/50 text-green-300">
                      Paid
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
