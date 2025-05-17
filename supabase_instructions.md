# Instructions pour ajouter la colonne "ville" à la table clients dans Supabase

Suivez ces étapes pour ajouter la colonne "ville" à votre table clients dans Supabase:

## 1. Accéder à l'interface SQL de Supabase

1. Connectez-vous à votre compte Supabase (https://app.supabase.io/)
2. Sélectionnez votre projet (URL: https://tdzgsjxdivbsnhqknbnd.supabase.co)
3. Dans le menu de gauche, cliquez sur "SQL Editor"
4. Cliquez sur "New Query" pour créer une nouvelle requête SQL

## 2. Exécuter le script SQL

Copiez et collez le script SQL suivant dans l'éditeur:

```sql
-- Add ville column to clients table
ALTER TABLE clients ADD COLUMN ville VARCHAR(100);

-- Update existing clients with a default city value
UPDATE clients SET ville = 'Casablanca' WHERE ville IS NULL;
```

## 3. Exécuter la requête

Cliquez sur le bouton "Run" pour exécuter la requête.

## 4. Vérifier que la colonne a été ajoutée

1. Dans le menu de gauche, cliquez sur "Table Editor"
2. Sélectionnez la table "clients"
3. Vérifiez que la colonne "ville" apparaît dans la liste des colonnes

## 5. Mettre à jour les données

Vous pouvez maintenant mettre à jour les données de ville pour chaque client en utilisant l'interface de Supabase ou en exécutant des requêtes SQL supplémentaires.

## Note importante

Si vous rencontrez une erreur indiquant que la colonne existe déjà, c'est que la colonne a peut-être été ajoutée précédemment. Dans ce cas, vous pouvez ignorer cette étape et passer directement à la mise à jour des données.
