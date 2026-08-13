const API_URL = "https://ai-website-generator-njw9.onrender.com";

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
// STARTUP
// =====================================================

console.log("AI Website Generator loaded.");


// =====================================================
// CHECK ELEMENTS
// =====================================================

if (!promptInput) {
    console.error("❌ #prompt not found");
}

if (!generateBtn) {
    console.error("❌ #generateBtn not found");
}

if (!preview) {
    console.error("❌ #preview not found");
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

    const prompt =
        promptInput.value.trim();


    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!prompt) {

        alert(
            "Please describe the website you want to generate."
        );

        return;

    }


    // -------------------------------------------------
    // BUTTON LOADING
    // -------------------------------------------------

    generateBtn.disabled = true;

    generateBtn.textContent =
        "✨ Generating...";


    console.log("🚀 Generate started");

    console.log(
        "API:",
        `${API_URL}/generate`
    );

    console.log(
        "Prompt:",
        prompt
    );


    try {

        // -------------------------------------------------
        // SEND REQUEST
        // -------------------------------------------------

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


        // -------------------------------------------------
        // READ RESPONSE
        // -------------------------------------------------

        const responseText =
            await response.text();


        console.log(
            "Raw backend response:",
            responseText
        );


        let data;


        try {

            data =
                JSON.parse(responseText);

        }

        catch (error) {

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


        // -------------------------------------------------
        // HTTP ERROR
        // -------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.detail ||
                `Server error: ${response.status}`
            );

        }


        // -------------------------------------------------
        // VALIDATE RESPONSE
        // -------------------------------------------------

        if (
            !data.html ||
            typeof data.html !== "string"
        ) {

            throw new Error(
                "Backend did not return valid HTML."
            );

        }


        // -------------------------------------------------
        // SAVE WEBSITE
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
            "✅ Website received"
        );


        // -------------------------------------------------
        // SHOW HTML
        // -------------------------------------------------

        currentFile = "html";

        updateFileButtons();

        updateCode();


        // -------------------------------------------------
        // UPDATE PREVIEW
        // -------------------------------------------------

        updatePreview();


        console.log(
            "🎉 Website generated successfully!"
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
        "Your generated code will appear here.";

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
    // EMPTY PREVIEW
    // -------------------------------------------------

    if (!generatedWebsite.html) {

        preview.srcdoc = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

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
        "🌐 Updating live preview..."
    );


    const html =
        generatedWebsite.html;

    const css =
        generatedWebsite.css;

    const js =
        generatedWebsite.js;


    // =================================================
    // CREATE SAFE PREVIEW DOCUMENT
    // =================================================

    const documentContent = `

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Generated Website</title>


<style>

/* ==============================
   GENERATED CSS
============================== */

${css}

</style>

</head>


<body>

<!-- ==============================
     GENERATED HTML
============================== -->

${html}


<!-- ==============================
     GENERATED JAVASCRIPT
============================== -->

<script>

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // =========================================
        // HANDLE GENERATED LINKS
        // =========================================

        document
            .querySelectorAll("a")
            .forEach(function (link) {

                const href =
                    link.getAttribute("href");


                if (!href) {
                    return;
                }


                // ---------------------------------
                // SECTION LINKS
                // Example: #about
                // ---------------------------------

                if (href.startsWith("#")) {

                    link.addEventListener(
                        "click",
                        function (event) {

                            const target =
                                document.querySelector(
                                    href
                                );


                            if (target) {

                                event.preventDefault();

                                target.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start"
                                });

                            }

                        }
                    );

                    return;

                }


                // ---------------------------------
                // EXTERNAL LINKS
                // ---------------------------------

                if (
                    href.startsWith("http://") ||
                    href.startsWith("https://")
                ) {

                    link.setAttribute(
                        "target",
                        "_blank"
                    );

                    link.setAttribute(
                        "rel",
                        "noopener noreferrer"
                    );

                }

            });


        // =========================================
        // HANDLE FORMS
        // =========================================

        document
            .querySelectorAll("form")
            .forEach(function (form) {

                form.addEventListener(
                    "submit",
                    function (event) {

                        event.preventDefault();

                        alert(
                            "Form submitted successfully!"
                        );

                    }
                );

            });

    }
);


// =============================================
// GENERATED JAVASCRIPT
// =============================================

try {

${js}

}

catch (error) {

console.error(
    "Generated website JavaScript error:",
    error
);

}

<\/script>


</body>

</html>

`;


    // =================================================
    // SET IFRAME CONTENT
    // =================================================

    preview.srcdoc =
        documentContent;


    console.log(
        "✅ Live preview updated."
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
                "Your generated code will appear here."
            ) {

                alert(
                    "There is no code to copy."
                );

                return;

            }


            try {

                await navigator
                    .clipboard
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
    // CHECK WEBSITE
    // -------------------------------------------------

    if (!generatedWebsite.html) {

        alert(
            "Generate a website first."
        );

        return;

    }


    // -------------------------------------------------
    // CHECK INSTRUCTION
    // -------------------------------------------------

    if (!instruction) {

        alert(
            "Describe what you want to change."
        );

        return;

    }


    // -------------------------------------------------
    // LOADING
    // -------------------------------------------------

    modifyBtn.disabled = true;

    modifyBtn.textContent =
        "✨ Modifying...";


    console.log(
        "🚀 Modification started"
    );


    try {

        const response =
            await fetch(
                `${API_URL}/modify`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
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
            "Modify status:",
            response.status
        );


        // -------------------------------------------------
        // READ RESPONSE
        // -------------------------------------------------

        const responseText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(responseText);

        }

        catch (error) {

            throw new Error(
                "Backend returned invalid JSON."
            );

        }


        console.log(
            "Modify response:",
            data
        );


        // -------------------------------------------------
        // HTTP ERROR
        // -------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.detail ||
                `Server error: ${response.status}`
            );

        }


        // -------------------------------------------------
        // VALIDATE
        // -------------------------------------------------

        if (!data.html) {

            throw new Error(
                "Backend did not return modified HTML."
            );

        }


        // -------------------------------------------------
        // UPDATE WEBSITE
        // -------------------------------------------------

        generatedWebsite = {

            html:
                data.html || "",

            css:
                data.css || "",

            js:
                data.js || ""

        };


        // -------------------------------------------------
        // SHOW UPDATED WEBSITE
        // -------------------------------------------------

        currentFile =
            "html";


        updateFileButtons();

        updateCode();

        updatePreview();


        // -------------------------------------------------
        // CLEAR INPUT
        // -------------------------------------------------

        modifyPrompt.value = "";


        console.log(
            "🎉 Website modified successfully!"
        );

    }


    catch (error) {

        console.error(
            "❌ Modification error:",
            error
        );


        alert(
            `Modification failed: ${error.message}`
        );

    }


    finally {

        modifyBtn.disabled = false;

        modifyBtn.textContent =
            "✨ Modify Website";

    }

}