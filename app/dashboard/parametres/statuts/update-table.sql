-- Add couleur column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'statuts'
        AND column_name = 'couleur'
    ) THEN
        ALTER TABLE statuts ADD COLUMN couleur VARCHAR(50) DEFAULT 'blue';
    END IF;
END $$;

-- Add ordre column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'statuts'
        AND column_name = 'ordre'
    ) THEN
        ALTER TABLE statuts ADD COLUMN ordre INT;

        -- Update ordre values based on existing records
        WITH ordered_statuses AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) as row_num
            FROM statuts
        )
        UPDATE statuts s
        SET ordre = os.row_num
        FROM ordered_statuses os
        WHERE s.id = os.id;
    END IF;
END $$;

-- Add actif column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'statuts'
        AND column_name = 'actif'
    ) THEN
        ALTER TABLE statuts ADD COLUMN actif BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Set default colors for existing statuses if couleur is null
UPDATE statuts
SET couleur = CASE
    WHEN nom ILIKE '%attente%' THEN 'blue'
    WHEN nom ILIKE '%pris%' OR nom ILIKE '%charge%' THEN 'orange'
    WHEN nom ILIKE '%cours%' OR nom ILIKE '%livraison%' THEN 'yellow'
    WHEN nom ILIKE '%livre%' THEN 'green'
    WHEN nom ILIKE '%refuse%' THEN 'red'
    WHEN nom ILIKE '%annule%' THEN 'gray'
    ELSE 'blue'
END
WHERE couleur IS NULL;
