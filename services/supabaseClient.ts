
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sotsvvhebafongxbadqk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H_urTsLGCsQqqFHGhYZ3ig_5E-xrAKa';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
