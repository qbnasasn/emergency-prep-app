'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast"


export default function TestAlertsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTestClick = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/test/low-stock-alert');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(JSON.stringify(data, null, 2));
       toast({
        title: "Test Complete",
        description: data.message,
      });
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Debugging: Test Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Click the button below to trigger a test for the low-stock inventory alert.
            This will attempt to find a low-stock item for your user and generate a notification.
            Check the Vercel runtime logs for detailed output.
          </p>
          <Button onClick={handleTestClick} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Low Stock Alert'}
          </Button>
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-bold">Result:</h3>
              <pre><code>{result}</code></pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
