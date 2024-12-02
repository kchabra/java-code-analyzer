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

    // Function to render Mermaid diagrams
    function renderMermaidDiagram(container, content) {
        // Create a div with class mermaid
        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.innerHTML = content;
        container.innerHTML = ''; // Clear existing content
        container.appendChild(mermaidDiv);
        
        // Call mermaid.init to render the diagram
        mermaid.init(undefined, '.mermaid');
    }

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
            if (visualOutput && data.visualAnalysis) {
                visualContainer.style.display = 'block';
                // Render the Mermaid diagram
                renderMermaidDiagram(visualContainer, data.visualAnalysis);
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

    document.getElementById('downloadBtn').addEventListener('click', async () => {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('jsPDF is not loaded properly!');
            return;
        }
    
        const { jsPDF } = window.jspdf;
        const code = editor.getValue();
        const analysis = document.getElementById('output').innerText; // Get textual analysis
        const visualContainer = document.getElementById('visual-container'); // Visual analysis container
    
        const doc = new jsPDF();
        doc.setFontSize(12);
    
        // Add code snippet
        doc.text('Code Snippet:', 10, 10);
        const codeLines = doc.splitTextToSize(code, 180);
        doc.text(codeLines, 10, 20);
    
        // Add textual analysis
        const yPosForAnalysis = 30 + codeLines.length * 5;
        doc.text('Textual Analysis:', 10, yPosForAnalysis);
        const analysisLines = doc.splitTextToSize(analysis, 180);
        doc.text(analysisLines, 10, yPosForAnalysis + 10);
    
        // Handle visual analysis if applicable
        if (visualOutput && visualContainer.style.display !== 'none') {
            try {
                // Ensure the container is visible and fully rendered before capturing
                const canvas = await html2canvas(visualContainer, {
                    scale: 2, // Increase quality
                    useCORS: true, // Handle cross-origin resources
                    allowTaint: true, // Allow tainted images
                });
    
                const imgData = canvas.toDataURL('image/png');
                const yPosForVisual = yPosForAnalysis + 10 + analysisLines.length * 5;
                doc.text('Visual Analysis:', 10, yPosForVisual);
                doc.addImage(imgData, 'PNG', 10, yPosForVisual + 10, 180, 80); // Add visual representation
            } catch (error) {
                console.error('Error capturing visual analysis:', error);
                alert('Failed to add visual analysis to the PDF. Please try again.');
            }
        }
    
        // Save the PDF
        doc.save('code_analysis.pdf');
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
