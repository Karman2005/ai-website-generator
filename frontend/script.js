const API_URL = "http://127.0.0.1:8000";


// =====================================================
// STATE
// =====================================================

let generatedWebsite = {
    html: "",
    css: "",
    js: ""
};

let currentFile = "html";


// =====================================================
// ELEMENTS
// =====================================================

const promptInput = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");

const modifyBtn = document.getElementById("modifyBtn");
const modifyPrompt = document.getElementById("modifyPrompt");

const codeOutput = document.getElementById("codeOutput");
const currentFileText = document.getElementById("currentFile");

const preview = document.getElementById("preview");

const copyBtn = document.getElementById("copyBtn");
const refreshBtn = document.getElementById("refreshBtn");

const charCount = document.getElementById("charCount");


// =====================================================
// CHECK REQUIRED ELEMENTS
// =====================================================

console.log("AI Website Generator loaded.");

if (!promptInput) {
    console.error("Element #prompt not found");
}

if (!generateBtn) {
    console.error("Element #generateBtn not found");
}

if (!preview) {
    console.error("Element #preview not found");
}


// =====================================================
// CHARACTER COUNTER
// =====================================================

if (promptInput && charCount) {

    promptInput.addEventListener("input", () => {

        const length = promptInput.value.length;

        charCount.textContent =
            `${length} / 1000`;

    });

}


// =====================================================
// GENERATE WEBSITE
// =====================================================

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        generateWebsite
    );

}


async function generateWebsite() {

    const prompt = promptInput.value.trim();

    if (!prompt) {
        alert("Please describe the website you want to generate.");
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "✨ Generating...";

    console.log("🚀 Generate started");
    console.log("Prompt:", prompt);

    try {

        const response = await fetch(
            `${API_URL}/generate`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify({
                    prompt: prompt
                })
            }
        );

        console.log(
            "Backend status:",
            response.status
        );


        // Get response as text first
        const responseText =
            await response.text();

        console.log(
            "Raw backend response:",
            responseText
        );


        // Convert response to JSON
        let data;

        try {

            data = JSON.parse(responseText);

        } catch (error) {

            console.error(
                "JSON parse error:",
                error
            );

            throw new Error(
                "Backend returned invalid JSON."
            );

        }


        console.log(
            "Parsed backend data:",
            data
        );


        // Check HTTP error
        if (!response.ok) {

            throw new Error(
                data.detail ||
                `Server error: ${response.status}`
            );

        }


        // Check HTML
        if (
            !data.html ||
            typeof data.html !== "string"
        ) {

            console.error(
                "HTML missing:",
                data
            );

            throw new Error(
                "Backend did not return valid HTML."
            );

        }


        // ==========================================
        // SAVE GENERATED WEBSITE
        // ==========================================

        generatedWebsite.html =
            data.html;

        generatedWebsite.css =
            data.css || "";

        generatedWebsite.js =
            data.js || "";


        console.log(
            "✅ generatedWebsite updated:",
            generatedWebsite
        );


        // ==========================================
        // SHOW HTML FILE
        // ==========================================

        currentFile = "html";

        updateFileButtons();

        updateCode();


        // ==========================================
        // RENDER PREVIEW
        // ==========================================

        updatePreview();


        console.log(
            "🎉 Website generation completed!"
        );

    }

    catch (error) {

        console.error(
            "❌ Generation error:",
            error
        );

        alert(
            `Generation failed: ${error.message}`
        );

    }

    finally {

        generateBtn.disabled = false;

        generateBtn.textContent =
            "✨ Generate Website";

    }

}


// =====================================================
// UPDATE CODE
// =====================================================

function updateCode() {

    if (!codeOutput) {
        return;
    }


    let code = "";


    if (currentFile === "html") {

        code =
            generatedWebsite.html;

        if (currentFileText) {

            currentFileText.textContent =
                "index.html";

        }

    }


    else if (currentFile === "css") {

        code =
            generatedWebsite.css;

        if (currentFileText) {

            currentFileText.textContent =
                "style.css";

        }

    }


    else if (currentFile === "js") {

        code =
            generatedWebsite.js;

        if (currentFileText) {

            currentFileText.textContent =
                "script.js";

        }

    }


    codeOutput.textContent =
        code ||
        "Your generated code will appear here...";

}


// =====================================================
// UPDATE FILE BUTTONS
// =====================================================

function updateFileButtons() {

    const files =
        document.querySelectorAll(".file");


    files.forEach(file => {

        file.classList.remove("active");

    });


    const activeFile =
        document.querySelector(
            `.file[data-file="${currentFile}"]`
        );


    if (activeFile) {

        activeFile.classList.add("active");

    }

}


// =====================================================
// FILE SWITCHING
// =====================================================

document
    .querySelectorAll(".file")
    .forEach(file => {

        file.addEventListener(
            "click",
            () => {

                currentFile =
                    file.dataset.file;


                updateFileButtons();

                updateCode();

            }
        );

    });


// =====================================================
// LIVE PREVIEW
// =====================================================

function updatePreview() {

    if (!preview) {

        console.error(
            "Preview iframe not found."
        );

        return;

    }


    // -------------------------------------------------
    // Check HTML
    // -------------------------------------------------

    if (!generatedWebsite.html) {

        preview.srcdoc = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Preview</title>

</head>

<body style="
    margin:0;
    height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    font-family:Arial,sans-serif;
    background:#f5f5f5;
">

<h2>
    Generate a website to see the preview.
</h2>

</body>

</html>

        `;

        return;

    }


    console.log(
        "Updating live preview..."
    );


    // -------------------------------------------------
    // Create complete document
    // -------------------------------------------------

    const documentContent = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>AI Generated Website</title>


<style>

/* Generated CSS */

${generatedWebsite.css}

</style>

</head>


<body>

<!-- Generated HTML -->

${generatedWebsite.html}


<!-- Generated JavaScript -->

<script>

try {

${generatedWebsite.js}

}

catch(error) {

console.error(
    "Generated website JavaScript error:",
    error
);

}

<\/script>


</body>

</html>

`;


    // -------------------------------------------------
    // Put website into iframe
    // -------------------------------------------------

    preview.srcdoc =
        documentContent;


    console.log(
        "Live preview updated."
    );

}


// =====================================================
// REFRESH PREVIEW
// =====================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        () => {

            updatePreview();

        }
    );

}


// =====================================================
// COPY CODE
// =====================================================

if (copyBtn) {

    copyBtn.addEventListener(
        "click",
        async () => {

            const code =
                codeOutput.textContent;


            if (
                !code ||
                code ===
                "Your generated code will appear here..."
            ) {

                alert(
                    "There is no code to copy."
                );

                return;

            }


            try {

                await navigator.clipboard
                    .writeText(code);


                copyBtn.textContent =
                    "Copied!";


                setTimeout(
                    () => {

                        copyBtn.textContent =
                            "Copy";

                    },
                    1500
                );

            }


            catch (error) {

                console.error(
                    "Copy error:",
                    error
                );

                alert(
                    "Unable to copy code."
                );

            }

        }
    );

}


// =====================================================
// MODIFY WEBSITE
// =====================================================

if (modifyBtn) {

    modifyBtn.addEventListener(
        "click",
        modifyWebsite
    );

}


async function modifyWebsite() {

    const instruction =
        modifyPrompt.value.trim();


    // -------------------------------------------------
    // Check website
    // -------------------------------------------------

    if (!generatedWebsite.html) {

        alert(
            "Generate a website first."
        );

        return;

    }


    // -------------------------------------------------
    // Check instruction
    // -------------------------------------------------

    if (!instruction) {

        alert(
            "Describe what you want to change."
        );

        return;

    }


    // -------------------------------------------------
    // Disable button
    // -------------------------------------------------

    modifyBtn.disabled = true;

    modifyBtn.textContent =
        "✨ Modifying...";


    try {

        console.log(
            "Sending modification request..."
        );


        // -------------------------------------------------
        // API REQUEST
        // -------------------------------------------------

        const response = await fetch(
            `${API_URL}/modify`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify({

                    html:
                        generatedWebsite.html,

                    css:
                        generatedWebsite.css,

                    js:
                        generatedWebsite.js,

                    instruction:
                        instruction

                })
            }
        );


        console.log(
            "Modify response status:",
            response.status
        );


        // -------------------------------------------------
        // Read response
        // -------------------------------------------------

        const data =
            await response.json();


        console.log(
            "Modify response:",
            data
        );


        // -------------------------------------------------
        // Check error
        // -------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.detail ||
                `Server error: ${response.status}`
            );

        }


        // -------------------------------------------------
        // Validate HTML
        // -------------------------------------------------

        if (!data.html) {

            throw new Error(
                "Backend did not return modified HTML."
            );

        }


        // -------------------------------------------------
        // Update website
        // -------------------------------------------------

        generatedWebsite = {

            html:
                data.html || "",

            css:
                data.css || "",

            js:
                data.js || ""

        };


        console.log(
            "Modified website:",
            generatedWebsite
        );


        // -------------------------------------------------
        // Show HTML
        // -------------------------------------------------

        currentFile =
            "html";


        updateFileButtons();

        updateCode();

        updatePreview();


        // -------------------------------------------------
        // Clear input
        // -------------------------------------------------

        modifyPrompt.value = "";


        console.log(
            "Website modified successfully."
        );

    }


    catch (error) {

        console.error(
            "Modification error:",
            error
        );


        alert(
            `Error: ${error.message}`
        );

    }


    finally {

        modifyBtn.disabled = false;

        modifyBtn.textContent =
            "✨ Modify Website";

    }

}