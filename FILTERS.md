# Filtering Functionality in LogiApp

This document explains how the filtering functionality works in the LogiApp application.

## Overview

The filtering functionality allows users to search and filter data in various pages of the application. The implementation uses React state management and Supabase queries to filter data on the server side.

## Implementation Details

### Database Structure

The filtering functionality relies on the Supabase database structure defined in `supabase/schema.sql`. The main tables include:

- `clients`: Stores client information
- `entreprises`: Stores company information
- `livreurs`: Stores delivery personnel information
- `colis`: Stores package information
- `bons`: Stores delivery notes information

### API Functions

The filtering functionality is implemented in the `lib/api.ts` file, which contains functions for fetching and filtering data from Supabase:

- `fetchColis`: Fetches packages with filters for search, status, delivery person, and sorting
- `fetchClients`: Fetches clients with search functionality
- `fetchEntreprises`: Fetches companies with search functionality
- `fetchLivreurs`: Fetches delivery personnel
- `fetchBons`: Fetches delivery notes with search functionality

### UI Components

The filtering UI is implemented in the respective page components:

- `app/colis/page.tsx`: Implements filtering for packages
- `app/clients/page.tsx`: Implements search for clients
- (Other pages can be implemented similarly)

## How to Use

### Colis Page Filtering

The Colis page (`/colis`) offers the following filtering options:

1. **Search**: Enter text to search for packages by ID or client name
2. **Status Filter**: Filter packages by their status (En attente, Pris en charge, etc.)
3. **Delivery Person Filter**: Filter packages by the assigned delivery person
4. **Sorting**: Sort packages by date (newest/oldest) or client name

### Clients Page Filtering

The Clients page (`/clients`) offers a search functionality that filters clients by:

- Name
- Phone number
- Email

## Adding Filtering to Other Pages

To add filtering to other pages, follow these steps:

1. Update the page component to use the client-side approach:
   - Add the `"use client"` directive
   - Import necessary hooks and API functions
   - Add state variables for filters
   - Use `useEffect` to fetch data with filters
   - Update the UI to include filter controls

2. Add or update the API function in `lib/api.ts` to support the required filtering options

## Example Implementation

Here's a simplified example of how to implement filtering:

```typescript
"use client"

import { useState, useEffect } from "react"
import { fetchData } from "@/lib/api"

export default function ExamplePage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const result = await fetchData(searchQuery || undefined)
        setData(result)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchQuery])

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {data.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

## Troubleshooting

If you encounter issues with the filtering functionality:

1. Check the browser console for errors
2. Verify that the Supabase database is properly set up
3. Ensure that the environment variables for Supabase are correctly configured
4. Check that the API functions in `lib/api.ts` are correctly implemented
5. Verify that the page components are correctly using the API functions
