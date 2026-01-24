-- Add price_valid_until to tours
ALTER TABLE tours ADD COLUMN IF NOT EXISTS price_valid_until DATE;

-- Update existing records to null (or a default far future date if desired, but null is fine for "always valid" or "check manually" if we assume logic handles it)
-- We will assume NULL means "Indefinite" or handle it in UI logic specific to the request "until configured period ends".
-- If user wants "button appears", it implies an expiration. So we can update nulls to today + 1 year for now, or just leave null.
-- Let's leave null and handle UI logic: if valid_until < today => show button.
