import { SupabaseExample } from '@/components/supabase-example';

export default function SupabaseTestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
      <p className="mb-6">
        This page tests the connection to your Supabase database. If you see data below, your connection is working correctly.
      </p>
      <SupabaseExample />
    </div>
  );
}
