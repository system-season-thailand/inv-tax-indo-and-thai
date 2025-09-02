const supabaseUrl = 'https://bdisyvjhbipknpxvyctb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkaXN5dmpoYmlwa25weHZ5Y3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTIyMzksImV4cCI6MjA2MjI4ODIzOX0.x3aLzQPaaMIUo4MDyPSeCPnG33LVEhtFhGvhY3SkdrQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let new_or_imported_inv_company_variable = 'new_invoice_company';
