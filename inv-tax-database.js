/* Code to store the data in the SupaBase */
const supabaseUrl = 'https://bdisyvjhbipknpxvyctb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkaXN5dmpoYmlwa25weHZ5Y3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTIyMzksImV4cCI6MjA2MjI4ODIzOX0.x3aLzQPaaMIUo4MDyPSeCPnG33LVEhtFhGvhY3SkdrQ';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);



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
        const { data: existingRows, error: fetchError } = await supabase
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
            const { data, error } = await supabase
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
            const { data, error } = await supabase
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