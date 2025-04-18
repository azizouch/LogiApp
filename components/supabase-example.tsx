'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SupabaseExample() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Replace 'your_table' with an actual table name in your Supabase database
        const { data, error } = await supabase
          .from('your_table')
          .select('*')
          .limit(5);
        
        if (error) {
          throw error;
        }
        
        setData(data);
      } catch (error: any) {
        setError(error.message || 'An error occurred while fetching data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading data from Supabase...</p>
        ) : error ? (
          <div className="text-red-500">
            <p>Error: {error}</p>
            <p className="mt-2">
              Note: This is expected if you haven't created a table named 'your_table' yet.
              Please create a table in your Supabase dashboard and update this component.
            </p>
          </div>
        ) : data && data.length > 0 ? (
          <div>
            <p className="mb-2">Data retrieved successfully:</p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        ) : (
          <p>No data found. Make sure your table exists and has data.</p>
        )}
      </CardContent>
    </Card>
  );
}
