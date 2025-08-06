import AnomalyAlertForm from '@/components/dashboard/anomaly-alert-form';

export default function AnomalyAlertsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold tracking-tight">Anomaly Detection Center</h1>
      <p className="text-muted-foreground">
        Leverage AI to automatically detect unusual patterns and outliers in your data.
      </p>
      <AnomalyAlertForm />
    </div>
  );
}
