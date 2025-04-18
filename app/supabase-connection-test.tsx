'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Testing connection to Supabase...');
  const [tables, setTables] = useState<string[]>([]);

  async function testConnection() {
    try {
      setStatus('loading');
      setMessage('Testing connection to Supabase...');
      
      // Simple query to test the connection
      const { data, error } = await supabase.from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (error) {
        throw error;
      }
      
      setStatus('success');
      setMessage('Successfully connected to Supabase!');
      setTables(data.map(t => t.tablename));
    } catch (error: any) {
      console.error('Supabase connection error:', error);
      setStatus('error');
      setMessage(`Error connecting to Supabase: ${error.message || error}`);
    }
  }

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 mb-4 rounded-md ${
            status === 'loading' ? 'bg-blue-50 text-blue-700' :
            status === 'success' ? 'bg-green-50 text-green-700' :
            'bg-red-50 text-red-700'
          }`}>
            <p>{message}</p>
          </div>
          
          {status === 'success' && (
            <div>
              <h3 className="text-lg font-medium mb-2">Available Tables:</h3>
              {tables.length === 0 ? (
                <p>No tables found in the public schema.</p>
              ) : (
                <ul className="list-disc pl-5">
                  {tables.map(table => (
                    <li key={table}>{table}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          <Button onClick={testConnection} className="mt-4">
            Test Connection Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
