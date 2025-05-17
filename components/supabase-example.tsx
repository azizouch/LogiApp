'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export function SupabaseExample() {
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[] | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [tableLoading, setTableLoading] = useState(false);

  // Check connection and get available tables
  useEffect(() => {
    async function checkConnection() {
      try {
        setLoading(true);
        setConnectionStatus('checking');

        // Test connection by making a simple request
        let connectionSuccessful = false;

        try {
          // First try: Simple REST API call
          const response = await fetch(`${supabase.supabaseUrl}/rest/v1/`, {
            headers: {
              'apikey': supabase.supabaseKey,
              'Authorization': `Bearer ${supabase.supabaseKey}`
            }
          });

          if (response.ok) {
            connectionSuccessful = true;
          }
        } catch (e) {
          console.warn('First connection test failed:', e);
          // Continue to next test
        }

        if (!connectionSuccessful) {
          try {
            // Second try: RPC call
            const { error: versionError } = await supabase.rpc('version');
            if (!versionError) {
              connectionSuccessful = true;
            }
          } catch (e) {
            console.warn('Second connection test failed:', e);
            // Continue to next test
          }
        }

        if (!connectionSuccessful) {
          // Final try: Check auth status
          const { error: authError } = await supabase.auth.getSession();
          if (authError) {
            throw new Error('Could not connect to Supabase API');
          }
          connectionSuccessful = true;
        }

        // Connection successful, now check if tables exist
        const expectedTables = ['clients', 'entreprises', 'livreurs', 'colis', 'bons', 'historique_colis'];
        const tables = [];

        try {
          // Try to query each table we expect to exist - using the same logic as the connection test page
          for (const tableName of expectedTables) {
            try {
              const { error } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });

              // If no error, the table exists
              if (!error) {
                tables.push(tableName);
              } else {
                console.warn(`Table ${tableName} not found:`, error.message);
              }
            } catch (tableError) {
              // Ignore errors here, they're expected if tables don't exist
              console.warn(`Error checking table ${tableName}:`, tableError);
            }
          }

          console.log('Found tables:', tables);
          // Set the available tables
          setAvailableTables(tables);
        } catch (e) {
          console.warn('Error checking tables:', e);
        }

        setConnectionStatus('connected');

        // If we have tables, select the first one
        if (tables.length > 0) {
          setSelectedTable(tables[0]);
          fetchTableData(tables[0]);
        }
      } catch (error: any) {
        console.error('Supabase connection error:', error);
        setConnectionStatus('error');
        setConnectionError(error.message || 'Failed to connect to Supabase');
      } finally {
        setLoading(false);
      }
    }

    checkConnection();
  }, []);

  // Fetch data from selected table
  async function fetchTableData(tableName: string) {
    if (!tableName) return;

    try {
      setTableLoading(true);
      setTableError(null);

      // First verify the table exists using the same approach as the connection test
      const { error: checkError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (checkError) {
        throw new Error(`Table ${tableName} does not exist: ${checkError.message}`);
      }

      // Now fetch the actual data
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);

      if (error) {
        throw error;
      }

      setTableData(data);
    } catch (error: any) {
      console.error(`Error fetching data from ${tableName}:`, error);

      // Check if this is a "table doesn't exist" error
      if (error.message.includes('does not exist')) {
        // Remove this table from availableTables
        setAvailableTables(prev => prev.filter(t => t !== tableName));
        // If we have other tables, select the first one
        if (availableTables.length > 1) {
          const nextTable = availableTables.find(t => t !== tableName);
          if (nextTable) {
            setSelectedTable(nextTable);
            fetchTableData(nextTable);
            return;
          }
        }
      }

      setTableError(error.message || `Error fetching data from ${tableName}`);
    } finally {
      setTableLoading(false);
    }
  }

  // Handle table selection
  function handleTableSelect(tableName: string) {
    setSelectedTable(tableName);
    fetchTableData(tableName);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Testing connection to Supabase...</p>
          </div>
        ) : connectionStatus === 'error' ? (
          <div className="flex items-start space-x-2 text-red-600 mb-4">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-medium">Connection Error</p>
              <p>{connectionError}</p>
              <p className="mt-2 text-sm">
                Please check your Supabase URL and API key in the .env file.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start space-x-2 text-green-600 mb-6">
              <CheckCircle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Connected to Supabase successfully!</p>
                <p className="text-sm">
                  {availableTables.length > 0
                    ? `Found ${availableTables.length} tables in your database.`
                    : "No tables found in your database. Please create tables using the 'Create Tables' page."}
                </p>
              </div>
            </div>

            {availableTables.length > 0 && (
              <div className="mb-6">
                <p className="mb-2 font-medium">Available Tables:</p>
                <div className="flex flex-wrap gap-2">
                  {availableTables.map(table => (
                    <Button
                      key={table}
                      variant={selectedTable === table ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTableSelect(table)}
                    >
                      {table}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedTable && (
              <div className="mt-4">
                <p className="font-medium mb-2">Data from '{selectedTable}' table:</p>

                {tableLoading ? (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>Loading data...</p>
                  </div>
                ) : tableError ? (
                  <div className="text-red-500">
                    <p>Error: {tableError}</p>
                  </div>
                ) : tableData && tableData.length > 0 ? (
                  <div>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm">
                      {JSON.stringify(tableData, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p>No data found in this table.</p>
                )}
              </div>
            )}

            {availableTables.length === 0 && (
              <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                <p className="font-medium text-yellow-800">No tables found</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your Supabase connection is working, but no tables were found. This is normal if you haven't created the tables yet.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  You need to create the following tables: clients, entreprises, livreurs, colis, bons, and historique_colis.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.location.href = '/sql-script'}
                  >
                    Use SQL Script
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/create-tables-now'}
                  >
                    Create Tables Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://app.supabase.com/project/_/editor', '_blank')}
                  >
                    Open Supabase Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
