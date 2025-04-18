# Supabase Integration for LogiApp

This document provides information about the Supabase integration in the LogiApp project.

## Configuration

The Supabase connection is configured using environment variables in the `.env` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://tdzgsjxdivbsnhqknbnd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkemdzanhkaXZic25ocWtuYm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMTEyNDcsImV4cCI6MjA2MDU4NzI0N30.HUWwVn9BYMynDIRSN20a0SelU7wzzQPvT0T2pkFsXeY
```

## Usage

### Supabase Client

The Supabase client is initialized in `lib/supabase.ts`. You can import it in your components like this:

```typescript
import { supabase } from '@/lib/supabase';
```

### Example Usage

Here's an example of how to use the Supabase client to fetch data:

```typescript
async function fetchData() {
  try {
    // Replace 'your_table' with an actual table name in your Supabase database
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .limit(10);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
```

### Authentication

To implement authentication with Supabase, you can use the following methods:

```typescript
// Sign up a new user
const { data, error } = await supabase.auth.signUp({
  email: 'example@email.com',
  password: 'example-password',
});

// Sign in a user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'example@email.com',
  password: 'example-password',
});

// Sign out
const { error } = await supabase.auth.signOut();
```

## Testing the Connection

You can test the Supabase connection by visiting the `/supabase-test` page in the application. This page attempts to fetch data from a table in your Supabase database.

## Next Steps

1. Create tables in your Supabase database
2. Update the example component to fetch data from your actual tables
3. Implement authentication if needed
4. Create API endpoints for your data operations

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
