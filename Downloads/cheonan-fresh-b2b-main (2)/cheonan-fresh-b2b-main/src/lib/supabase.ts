import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://aylapssauzaajxtpnnni.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bGFwc3NhdXphYWp4dHBubm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTkwNjgsImV4cCI6MjA4ODM3NTA2OH0.fTUNl6An0oZIVBafZJPHq8EZv2mKwqd3rAIKa5z2AHU";

// 바로 이 부분이 에러에서 찾던 'export supabase' 입니다!
export const supabase = createClient(supabaseUrl, supabaseAnonKey);