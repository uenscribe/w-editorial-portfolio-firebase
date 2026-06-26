import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://xghezssbhsgqzvkcksyo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaGV6c3NiaHNncXp2a2Nrc3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NDg2MzQsImV4cCI6MjA5ODAyNDYzNH0.3elo4gu9cGzDuXqyd0RngrLpqUQ4WkDzFKmKdFrkEe0"
)