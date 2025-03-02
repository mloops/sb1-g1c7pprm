/*
  # Create financial models table

  1. New Tables
    - `financial_models`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `financial_models` table
    - Add policies for authenticated users to manage their own models
*/

-- Create the financial_models table if it doesn't exist
CREATE TABLE IF NOT EXISTS financial_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE financial_models ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can read own models"
  ON financial_models
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own models"
  ON financial_models
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own models"
  ON financial_models
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own models"
  ON financial_models
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS financial_models_user_id_idx ON financial_models(user_id);
CREATE INDEX IF NOT EXISTS financial_models_updated_at_idx ON financial_models(updated_at DESC);
CREATE INDEX IF NOT EXISTS financial_models_name_idx ON financial_models(name);