document.addEventListener('DOMContentLoaded', function () {
    // Configure Monaco Editor path
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.28.1/min/vs' } });
    let editor;
    let explanationType = 'high'; // Default explanation type
    let visualOutput = false; // Default visual output toggle

    // Initialize Monaco Editor
    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('codeInput'), {
            value: "// Type your Java code here...",
            language: 'java',
            theme: 'vs-dark',
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
        });
    });

    // Analyze button functionality
    document.getElementById('analyzeBtn').addEventListener('click', async () => {
        const code = editor.getValue();

        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, explanationType, visualOutput }),
        });

        if (response.ok) {
            const data = await response.json();

            // Render textual explanation
            const output = document.getElementById('output');
            output.innerHTML = data.analysis;

            // Handle visual output toggle
            const visualContainer = document.getElementById('visual-container');
            if (visualOutput) {
                visualContainer.style.display = 'block';
                visualContainer.innerHTML = data.visualAnalysis;
            } else {
                visualContainer.style.display = 'none';
            }
        } else {
            document.getElementById('output').innerText = 'Failed to analyze the code.';
        }

        // Apply syntax highlighting if needed
        Prism.highlightAll();
    });

    // Clear code functionality
    document.getElementById('clearBtn').addEventListener('click', () => {
        editor.setValue('');
        document.getElementById('output').innerText = '';
        document.getElementById('visual-container').innerHTML = ''; // Clear visual container
        document.getElementById('visual-container').style.display = 'none';
    });

    // Toggle for explanation type (High-Level/Detailed)
    document.getElementById('explanationToggle').addEventListener('change', (e) => {
        explanationType = e.target.checked ? 'detailed' : 'high';
    });

    // Toggle for visual output
    document.getElementById('visualToggle').addEventListener('change', (e) => {
        visualOutput = e.target.checked;
    });
});
