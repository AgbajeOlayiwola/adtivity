import PredictiveForecastForm from '@/components/dashboard/predictive-forecast-form';

export default function PredictiveForecastingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold tracking-tight">Predictive Forecasting Hub</h1>
       <p className="text-muted-foreground">
        Understand future trends with AI-powered forecasting summaries.
      </p>
      <PredictiveForecastForm />
    </div>
  );
}
