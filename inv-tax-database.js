/* Code to store the data in the SupaBase
   - This file now initializes two Supabase clients (primary & secondary)
   - Use window.setActiveSupabase('primary'|'secondary') to switch at runtime
   - window.activeSupabase will be used by other modules for fetch/insert operations
*/
const supabaseUrl = 'https://zrunsrimyijarswjfycw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydW5zcmlteWlqYXJzd2pmeWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjgzOTEsImV4cCI6MjA2MjMwNDM5MX0.UdW4LiIY-t1jZlrat1VUGnW0yRE7YEzW5SHbpkE29H8';
// Primary client (existing)
const supabase1 = window.supabase.createClient(supabaseUrl, supabaseKey);

// Secondary client (new project requested)
const supabaseUrl2 = 'https://lpyfcvjljejmxgoynbxb.supabase.co';
const supabaseKey2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweWZjdmpsamVqbXhnb3luYnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODk4OTYsImV4cCI6MjA2MjQ2NTg5Nn0.Ml7ICH8BoBZFbdRW-hOaN3OFX5j386QR_z0C4KmTt5k';
const supabase2 = window.supabase.createClient(supabaseUrl2, supabaseKey2);

// Expose both on window for debugging/advanced use, and set an active client
window.supabase1 = supabase1;
window.supabase2 = supabase2;

let activeSupabase = supabase1; // default to primary
window.activeSupabase = activeSupabase;

// Helper to switch active client at runtime. Use 'primary' or 'secondary'.
window.setActiveSupabase = function (which) {
    if (which === 'secondary' || which === 2) {
        activeSupabase = supabase2;
    } else {
        activeSupabase = supabase1;
    }
    window.activeSupabase = activeSupabase;
    console.info('Active Supabase client set to', which === 'secondary' || which === 2 ? 'secondary' : 'primary');
};



async function sendDataToSupabase() {

    const fileName = document.getElementById('pdf_file_name_input_id').value;


    /* Get the user current month na dyear to store it in the supabase for later use when deleteing data */
    const currentDate = new Date();

    const inv_company_current_user_date_options = {
        weekday: 'long',     // Optional: "Monday", "Tuesday", etc.
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true         // Use false if you prefer 24-hour format
    };
    const currentUserFullDate = currentDate.toLocaleString('en-US', inv_company_current_user_date_options);




    try {
        // Use the active client so saving/loading can target the selected project
        const { data: existingRows, error: fetchError } = await window.activeSupabase
            .from('inv_tax_indo_thai_fathi')
            .select('name')
            .eq('name', fileName);

        const existing = existingRows && existingRows.length > 0 ? existingRows[0] : null;


        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("❌ Error checking existing:", fetchError);
            return;
        }


        if (existing) {
            /* Get the html elements ready to store */
            const htmlContent = cleanHTML(document.getElementById("whole_invoice_company_section_id").innerHTML);


            /* console.log('🟡 Existing invoice found, updating HTML content only...'); */
            const { data, error } = await window.activeSupabase
                .from('inv_tax_indo_thai_fathi')
                .update({
                    inv_tax_all_content_fathi: htmlContent,
                    all_inv_tax_user_current_date_fathi: currentUserFullDate
                })
                .eq('name', fileName)
                .select();


            if (error) console.error("❌ Update failed:", error);
            else console.log("✅ Updated invoice content only:", data[0]);



        } else {



            /* Get the html elements ready to store */
            const htmlContent = cleanHTML(document.getElementById("whole_invoice_company_section_id").innerHTML);



            console.log('🟢 No existing data, inserting new...');
            const { data, error } = await window.activeSupabase
                .from('inv_tax_indo_thai_fathi')
                .insert([{
                    name: fileName,
                    inv_tax_all_content_fathi: htmlContent,
                    all_inv_tax_user_current_date_fathi: currentUserFullDate
                }])
                .select();

            if (error) console.error("❌ Insert failed:", error);
            else console.log("✅ Inserted new data:", data[0]);
        }



    } catch (error) {
        console.error("🔥 Unexpected error:", error);
    }
}


// Function to clean HTML by removing unnecessary attributes and tags
function cleanHTML(html) {
    // Remove HTML comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    // Trim excessive spaces
    return html.replace(/\s+/g, ' ').trim();
}