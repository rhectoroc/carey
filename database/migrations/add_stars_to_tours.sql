-- Migration to add stars column to tours table
ALTER TABLE tours ADD COLUMN stars INTEGER DEFAULT 5;
