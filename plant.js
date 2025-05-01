async function identifyPlant() {
    const fileInput = document.getElementById("plantUpload");
    const resultDiv = document.getElementById("result");

    if (fileInput.files.length === 0) {
        alert("Please upload an image");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = async function () {
        const base64String = reader.result.split(',')[1]; // Convert image to Base64
        const plantApiKey = "1doPikvTD2Dk93BDymxZaIP6aTqTTd6uk7jde8mJcbOEM2McRO"; // Replace with your key

        try {
            // Step 1: Identify the plant
            const response = await fetch("https://api.plant.id/v2/identify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Api-Key": plantApiKey
                },
                body: JSON.stringify({
                    images: [base64String],
                    similar_images: true
                })
            });

            const data = await response.json();
            console.log("Plant ID API Response:", data);

            if (data.suggestions && data.suggestions.length > 0) {
                const plant = data.suggestions[0];

                const plantName = plant.plant_name || "Unknown Plant";
                const scientificName = plant.plant_details?.scientific_name || "N/A";
                const commonNames = plant.plant_details?.common_names?.join(", ") || "Not Available";
                const description = plant.plant_details?.description || "No description available.";
                const plantImage = plant.similar_images?.[0]?.url || ""; // Image from Plant ID

                // Step 2: Fetch additional medicinal info & image from Wikipedia
                const { medicinalUses, wikiImage } = await fetchMedicinalInfo(plantName);
                const finalImage = plantImage || wikiImage || "https://via.placeholder.com/200"; // Use the best available image

                // Display results
                resultDiv.innerHTML = `
                    <img src="${finalImage}" width="200px"> <br>
                    <strong>Details:</strong> ${medicinalUses} <br>
                    
                `;
            } else {
                resultDiv.innerHTML = "⚠️ Plant not recognized. Try another image!";
            }

        } catch (error) {
            console.error("Error:", error);
            resultDiv.innerHTML = "⚠️ An error occurred. Please try again!";
        }
    };

    reader.readAsDataURL(file); // Read file as Base64
}

// Fetch medicinal info & image from Wikipedia
async function fetchMedicinalInfo(plantName) {
    try {
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(plantName)}`;
        const response = await fetch(wikiUrl);
        const data = await response.json();
        
        const medicinalUses = data.extract || "No medicinal information available.";
        const wikiImage = data.thumbnail?.source || ""; // Get image from Wikipedia if available

        return { medicinalUses, wikiImage };
    } catch (error) {
        console.error("Wikipedia API Error:", error);
        return { medicinalUses: "Could not fetch medicinal details.", wikiImage: "" };
    }
}
