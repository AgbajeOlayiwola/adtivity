'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateAnomalyAlert, type AnomalyAlertInput, type AnomalyAlertOutput } from '@/ai/flows/anomaly-alerts';
import { AlertTriangle, CheckCircle2, Loader2, BrainCircuit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  kpiData: z.string().min(10, {
    message: 'KPI Data must be at least 10 characters.',
  }).refine((data) => {
    try {
      JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: 'KPI Data must be a valid JSON string.'}),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
});

type AnomalyFormValues = z.infer<typeof formSchema>;

export default function AnomalyAlertForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnomalyAlertOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<AnomalyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kpiData: '{\n  "metric": "user_signups",\n  "values": [10, 12, 11, 9, 100, 13, 15],\n  "timestamps": ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05", "2023-01-06", "2023-01-07"]\n}',
      description: 'Daily user signups for the past week. Expecting consistent numbers around 10-15.',
    },
  });

  async function onSubmit(values: AnomalyFormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const aiInput: AnomalyAlertInput = {
        kpiData: values.kpiData,
        description: values.description,
      };
      const aiResult = await generateAnomalyAlert(aiInput);
      setResult(aiResult);
      if (aiResult.hasAnomaly && aiResult.alertMessage.startsWith("Invalid KPI data format")) {
         toast({
            variant: "destructive",
            title: "Error Processing Data",
            description: aiResult.alertMessage,
         });
      }
    } catch (error) {
      console.error('Error generating anomaly alert:', error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to generate anomaly alert. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <BrainCircuit className="mr-2 h-6 w-6 text-primary" />
          AI Anomaly Detection
        </CardTitle>
        <CardDescription>
          Input your KPI data (as a JSON string) and a description of what to look for. The AI will analyze it for anomalies.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="kpiData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Data (JSON String)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='e.g., {"metric": "sales", "values": [10, 12, 50, 13]}'
                      className="min-h-[150px] font-code bg-background/50 border-border/70 focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Description & Anomaly Context</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Daily sales figures. Expecting values between 10-15."
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
                  Analyzing...
                </>
              ) : (
                'Detect Anomalies'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {result && (
        <div className="p-6 pt-0">
          <Alert variant={result.hasAnomaly ? 'destructive' : 'default'} className={result.hasAnomaly ? 'border-red-500/50 bg-red-900/20 text-red-200' : 'border-green-500/50 bg-green-900/20 text-green-200'}>
            {result.hasAnomaly ? <AlertTriangle className="h-5 w-5 text-red-400" /> : <CheckCircle2 className="h-5 w-5 text-green-400" />}
            <AlertTitle className={result.hasAnomaly ? '!text-red-300' : '!text-green-300'}>
              {result.hasAnomaly ? 'Anomaly Detected!' : 'No Anomalies Found'}
            </AlertTitle>
            <AlertDescription className={result.hasAnomaly ? '!text-red-200/80' : '!text-green-200/80'}>
              {result.alertMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}
