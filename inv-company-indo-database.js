// Global array to store all fetched data
let inv_tax_indo_allFetchedData = [];

const inv_comp_indo_fetchBatchFromSupabase = async () => {
    const batchSize = 1000;            // How many rows to fetch per request
    let start = 0;                     // Starting index for the current batch

    inv_tax_indo_allFetchedData = [];               // Reset the global cache before refilling

    while (true) {
        const { data, error } = await window.activeSupabase
            .from('inv_tax_indo')
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
        inv_tax_indo_allFetchedData.push(
            ...data.map(row => ({
                name: row.name?.trim(),
                content: row.inv_tax_indo_content?.trim()
            }))
        );

        // If the batch was smaller than batchSize we reached the end
        if (data.length < batchSize) {
            break;
        }

        start += batchSize; // Move to the next batch
    }
};

const inv_tax_indo_loadAllData = async () => {
    const container = document.getElementById("all_supabase_stored_inv_tax_indo_data_names_for_importing_data_div");

    if (!container) {
        console.error("❌ Could not find #all_supabase_stored_inv_tax_indo_data_names_for_importing_data_div");
        return;
    }

    container.innerHTML = '';

    await inv_comp_indo_fetchBatchFromSupabase(); // assumes it fills inv_tax_indo_allFetchedData globally


    const allDataSet = new Set();
    const batchHTMLElements = [];


    inv_tax_indo_allFetchedData.forEach(row => {

        if (row.name && !allDataSet.has(row.name)) {
            allDataSet.add(row.name);

            const h3 = document.createElement("h3");
            h3.textContent = row.name;
            h3.setAttribute('data-original-name', row.name);

            h3.onclick = function () {
                handleH3Selection(this);
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
















