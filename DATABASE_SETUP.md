# Database Setup Guide for LogiApp

This guide will help you set up the Supabase database for your LogiApp application.

## Error: "relation 'public.livreurs' does not exist"

If you're seeing this error, it means that the tables required by the application haven't been created in your Supabase database yet. Follow the steps below to create them.

## Option 1: Using the Create Tables Page

The easiest way to create the necessary tables is to use the built-in "Create Tables" page in the application:

1. Navigate to the "Create Tables" page from the sidebar
2. Click the "Create Tables (Method 1)" button
3. If that doesn't work, try the "Create Tables (Method 2)" button
4. Check the log section for any errors

## Option 2: Manual Setup in Supabase Dashboard

If the automatic setup doesn't work, you can manually create the tables in the Supabase dashboard:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to the "SQL Editor" section
4. Create a new query
5. Copy and paste the SQL from the `supabase/schema.sql` file in your project
6. Run the query

## Database Schema

The application requires the following tables:

- `clients`: Stores client information
- `entreprises`: Stores company information
- `livreurs`: Stores delivery personnel information
- `colis`: Stores package information
- `bons`: Stores delivery notes information
- `historique_colis`: Stores package history

## Troubleshooting

### Tables Not Created

If you're still having issues creating the tables:

1. Check the Supabase URL and API key in your `.env` file
2. Make sure your Supabase project is active
3. Check if you have the necessary permissions to create tables

### Data Not Showing Up

If the tables are created but no data is showing up:

1. Check the "Connection Test" page to verify your Supabase connection
2. Check the browser console for any errors
3. Make sure the sample data was inserted correctly

## Fallback to Mock Data

The application is designed to use mock data if the database tables don't exist or if there's an error connecting to the database. This allows you to use the application even if the database setup isn't complete.

To switch to using the real database:

1. Complete the database setup as described above
2. Refresh the application

## Need Help?

If you're still having issues with the database setup, please:

1. Check the browser console for specific error messages
2. Review the Supabase documentation at [https://supabase.com/docs](https://supabase.com/docs)
3. Contact support for further assistance
