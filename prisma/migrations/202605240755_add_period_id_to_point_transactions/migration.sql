-- Add periodId column to point_transactions table
ALTER TABLE "point_transactions" ADD COLUMN "periodId" TEXT;

-- Add foreign key constraint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_periodId_fkey" 
  FOREIGN KEY ("periodId") REFERENCES "academic_periods"("id") ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS "point_transactions_periodId_idx" ON "point_transactions"("periodId");