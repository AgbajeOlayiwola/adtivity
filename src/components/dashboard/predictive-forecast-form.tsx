'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { predictiveForecastingSummary, type PredictiveForecastingSummaryInput, type PredictiveForecastingSummaryOutput } from '@/ai/flows/predictive-forecasting-summary';
import { Loader2, TrendingUp, Lightbulb, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  historicalData: z.string().min(20, { message: 'Historical data must be at least 20 characters.' }),
  forecastedData: z.string().min(20, { message: 'Forecasted data must be at least 20 characters.' }),
  relevantBusinessContext: z.string().min(20, { message: 'Business context must be at least 20 characters.' }),
});

type ForecastFormValues = z.infer<typeof formSchema>;

export default function PredictiveForecastForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictiveForecastingSummaryOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<ForecastFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      historicalData: 'Past 12 months sales data: [100, 120, 130, 110, 140, 150, 160, 145, 170, 180, 190, 200]',
      forecastedData: 'Next 3 months forecast: [210, 220, 205]',
      relevantBusinessContext: 'We are a SaaS company selling subscription software. Recently launched a new marketing campaign.',
    },
  });

  async function onSubmit(values: ForecastFormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const aiInput: PredictiveForecastingSummaryInput = {
        historicalData: values.historicalData,
        forecastedData: values.forecastedData,
        relevantBusinessContext: values.relevantBusinessContext,
      };
      const aiResult = await predictiveForecastingSummary(aiInput);
      setResult(aiResult);
    } catch (error) {
      console.error('Error generating forecast summary:', error);
       toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to generate forecast summary. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <TrendingUp className="mr-2 h-6 w-6 text-primary" />
            AI Predictive Forecasting Summary
          </CardTitle>
          <CardDescription>
            Provide historical data, forecasted data, and business context. The AI will generate a summary of key takeaways.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="historicalData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter historical data..."
                        className="min-h-[100px] bg-background/50 border-border/70 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="forecastedData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forecasted Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter forecasted data..."
                        className="min-h-[100px] bg-background/50 border-border/70 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relevantBusinessContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Business Context</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your business and any relevant context..."
                        className="min-h-[100px] bg-background/50 border-border/70 focus:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2 text-base shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-primary/50 transform hover:scale-105">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  'Generate Summary'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {result && (
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center text-primary">
                <Lightbulb className="mr-2 h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{result.summary}</CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center text-accent">
                <TrendingUp className="mr-2 h-5 w-5" />
                Key Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{result.keyTrends}</CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center text-yellow-500">
                <AlertCircle className="mr-2 h-5 w-5" />
                Potential Risks/Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{result.potentialRisks}</CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
