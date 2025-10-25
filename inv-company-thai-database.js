// Global array to store all fetched data
let inv_tax_thai_allFetchedData = [];
// Keep track of which Supabase client instances we've already loaded from to avoid duplicate fetches
const inv_tax_thai_loadedClients = new WeakSet();

/**
 * Fetch batches from Supabase for the `inv_tax_thai` table.
 * @param {object} client - Optional Supabase client to use. Defaults to window.activeSupabase.
 */
const inv_comp_thai_fetchBatchFromSupabase = async (client = window.activeSupabase) => {
    const batchSize = 1000;            // How many rows to fetch per request
    let start = 0;                     // Starting index for the current batch

    inv_tax_thai_allFetchedData = [];               // Reset the global cache before refilling

    if (!client) {
        console.warn('No Supabase client provided and window.activeSupabase is not set. Aborting fetch.');
        return;
    }

    while (true) {
        const { data, error } = await client
            .from('inv_tax_thai')
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
        inv_tax_thai_allFetchedData.push(
            ...data.map(row => ({
                name: row.name?.trim(),
                content: row.inv_tax_thai_content?.trim()
            }))
        );

        // If the batch was smaller than batchSize we reached the end
        if (data.length < batchSize) {
            break;
        }

        start += batchSize; // Move to the next batch
    }
};

/**
 * Load all Thai company names into the UI dropdown.
 * @param {('active'|'primary'|'secondary'|object)} which - Optional. 'active' (default), 'primary', 'secondary', or a Supabase client instance.
 */
const inv_tax_thai_loadAllData = async (which = 'active') => {
    const container = document.getElementById("all_supabase_stored_inv_tax_thai_data_names_for_importing_data_div");

    if (!container) {
        console.error("❌ Could not find #all_supabase_stored_inv_tax_thai_data_names_for_importing_data_div");
        return;
    }

    container.innerHTML = '';

    // Resolve which client to use
    let clientToUse = null;
    if (which === 'secondary' || which === 2) {
        clientToUse = window.supabase2;
    } else if (which === 'primary' || which === 1) {
        clientToUse = window.supabase1;
    } else if (typeof which === 'object' && which !== null && typeof which.from === 'function') {
        clientToUse = which; // directly provided client
    } else {
        clientToUse = window.activeSupabase;
    }

    if (!clientToUse) {
        console.error('No Supabase client available to load Thai companies. Call window.setActiveSupabase or pass a client.');
        return;
    }



    // Avoid duplicate fetches for the same client instance
    try {
        if (!inv_tax_thai_loadedClients.has(clientToUse)) {
            await inv_comp_thai_fetchBatchFromSupabase(clientToUse); // fills inv_tax_thai_allFetchedData globally
            // mark as loaded for this client
            inv_tax_thai_loadedClients.add(clientToUse);
        }

        
    } catch (err) {
        console.error('Error while fetching Thai company data:', err);
    }


    const allDataSet = new Set();
    const batchHTMLElements = [];


    inv_tax_thai_allFetchedData.forEach(row => {

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
















