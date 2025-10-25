// Global array to store all fetched data
let inv_all_saved_tax_fathi_allFetchedData = [];

const inv_all_saved_tax_fathi_fetchBatchFromSupabase = async () => {
    const batchSize = 1000;            // How many rows to fetch per request
    let start = 0;                     // Starting index for the current batch

    inv_all_saved_tax_fathi_allFetchedData = [];               // Reset the global cache before refilling

    while (true) {
        const { data, error } = await window.activeSupabase
            .from('inv_tax_indo_thai_fathi')
            .select('*')
            .range(start, start + batchSize - 1); // Fetch the current 1,000-row window

        if (error) {
            console.error("❌ Error fetching data from Supabase:", error);
            break; // Abort on error – you may choose to retry depending on needs
        }

        if (!data || data.length === 0) {
            // No more rows left to fetch
            break;
        }

        // Map and push current batch into the global store
        inv_all_saved_tax_fathi_allFetchedData.push(
            ...data.map(row => ({
                name: row.name?.trim(),
                content: row.inv_tax_all_content_fathi?.trim()
            }))
        );

        // If the batch was smaller than batchSize we reached the end
        if (data.length < batchSize) {
            break;
        }

        start += batchSize; // Move to the next batch
    }
};

const inv_all_saved_tax_fathi_loadAllData = async () => {
    const container = document.getElementById("all_supabase_stored_all_saved_inv_tax_fathi_data_names_for_importing_data_div");

    if (!container) {
        console.error("❌ Could not find #all_supabase_stored_all_saved_inv_tax_fathi_data_names_for_importing_data_div");
        return;
    }

    container.innerHTML = '';

    await inv_all_saved_tax_fathi_fetchBatchFromSupabase(); // assumes it fills inv_all_saved_tax_fathi_allFetchedData globally


    const allDataSet = new Set();
    const batchHTMLElements = [];


    inv_all_saved_tax_fathi_allFetchedData.forEach(row => {

        if (row.name && !allDataSet.has(row.name)) {
            allDataSet.add(row.name);

            const h3 = document.createElement("h3");
            h3.textContent = row.name;
            h3.setAttribute('data-original-name', row.name);

            h3.onclick = function () {
                importContentForSelectedName(this);
            };

            batchHTMLElements.push(h3);

        }
    });

    if (batchHTMLElements.length === 0) {
        console.warn("⚠️ No unique entries found to display.");
    } else {
        // Reverse the order before appending
        batchHTMLElements.reverse().forEach(el => {
            container.appendChild(el);
        });
    }

    // Optional: trigger input filter if any
    document.querySelectorAll('.search_bar_input_class').forEach(input => {
        if (input.value.trim()) {
            let event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        }
    });
};




















// Function to import content for selected name
const importContentForSelectedName = (clickedGoogleSheetDataName) => {
    const wholeInvoiceSection = document.getElementById("whole_invoice_company_section_id");



    if (clickedGoogleSheetDataName.style.backgroundColor === 'rgb(0, 155, 0)') {

        // Find the object that matches the selected name
        let foundObject = inv_all_saved_tax_fathi_allFetchedData.find(obj => obj.name === clickedGoogleSheetDataName.innerText.trim());

        // Play a sound effect
        playSoundEffect('success');


        /* Insert the imported data into the 'whole_invoice_company_section_id' */
        wholeInvoiceSection.innerHTML = foundObject.content;


        /* Hide the google sheet data */
        hideOverlay();

        /* Call a function to make all elements editable */
        makeDivContentEditable();

        // Call the function to apply the duplicate elements functionality
        setupDuplicateOptions("duplicate_this_element_class", "invoice_company_row_div_class");




        /* Set Today's Date */
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][today.getMonth()];
        const year = today.getFullYear();

        document.getElementById("today_inv_company_date_p_id").innerText = `Date: ${day} ${month} ${year}`;




    } else {

        // Get all <h3> elements inside the 'all_supabase_stored_all_saved_inv_tax_fathi_data_names_for_importing_data_div' div
        let allGoogleSheetStoredDataNamesForImportingDataDiv = document.querySelectorAll('#all_supabase_stored_all_saved_inv_tax_fathi_data_names_for_importing_data_div h3');


        // Loop through each <h3> element to reset their styles
        allGoogleSheetStoredDataNamesForImportingDataDiv.forEach(function (dataName) {
            dataName.style.backgroundColor = 'white';
            dataName.style.color = 'black';
        });


        // Set the background color and text color of the clicked <h3> element
        clickedGoogleSheetDataName.style.backgroundColor = 'rgb(0, 155, 0)';
        clickedGoogleSheetDataName.style.color = 'white';
    }
};