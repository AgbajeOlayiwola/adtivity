import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/shared/date-picker-with-range'; // Assuming this component exists or will be created
import { FileText, Download, Settings2 } from 'lucide-react';
import Image from 'next/image';

// Placeholder for DatePickerWithRange if not available
const DatePickerWithRangePlaceholder = () => (
  <div className="p-2 border rounded-md text-sm text-muted-foreground bg-background/50">Date Range Picker Placeholder</div>
);


export default function CustomReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold tracking-tight">Custom Report Generator</h1>
          <p className="text-muted-foreground mt-1">
            Tailor your reports with specific metrics, date ranges, and export options.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105">
          <Download className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Settings2 className="mr-2 h-6 w-6 text-primary" />
            Report Configuration
          </CardTitle>
          <CardDescription>
            Select your desired parameters to build a custom report.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportName">Report Name</Label>
              <Input id="reportName" placeholder="e.g., Q3 Sales Performance" className="bg-background/50 border-border/70 focus:border-primary" />
            </div>
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              {/* Replace with actual DatePickerWithRange if available */}
              <DatePickerWithRangePlaceholder />
            </div>
            <div>
              <Label htmlFor="metrics">Metrics</Label>
              <Select>
                <SelectTrigger className="bg-background/50 border-border/70 focus:border-primary">
                  <SelectValue placeholder="Select metrics (e.g., Revenue, Users, Conversion)" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-popover">
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="users">Active Users</SelectItem>
                  <SelectItem value="conversion">Conversion Rate</SelectItem>
                  <SelectItem value="page_views">Page Views</SelectItem>
                </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple metrics.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger className="bg-background/50 border-border/70 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-popover">
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="filters">Filters</Label>
              <Input id="filters" placeholder="e.g., country:USA, campaign:SummerSale" className="bg-background/50 border-border/70 focus:border-primary" />
               <p className="text-xs text-muted-foreground mt-1">Apply custom filters to narrow down data.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center py-10">
        <FileText className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold text-muted-foreground">No Reports Generated Yet</h3>
        <p className="text-sm text-muted-foreground">Configure and generate your first custom report to see it appear here.</p>
      </div>
    </div>
  );
}
