import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('children').select('*').limit(1);
  console.log("Children fields:", Object.keys(data[0] || {}));
  
  const { data: rData, error: rError } = await supabase.from('rewards').select('*').limit(1);
  console.log("Rewards fields:", Object.keys(rData?.[0] || {}));
}
check();
