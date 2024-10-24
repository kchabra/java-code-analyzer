document.addEventListener('DOMContentLoaded', function () {
    require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.28.1/min/vs' } });
    let editor;
    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('codeInput'), {
            value: "// Type your C++ code here...",
            language: 'cpp',
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('output').innerText = data.analysis;
        } else {
            document.getElementById('output').innerText = "Failed to analyze the code.";
        }

        // Applying syntax highlighting
        Prism.highlightAll();
    });

    // Clear code functionality
    document.getElementById('clearBtn').addEventListener('click', () => {
        editor.setValue(""); 
        document.getElementById('output').innerText = ""; 
    });


    document.getElementById('downloadBtn').addEventListener('click', () => {
        // Check
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("jsPDF is not loaded properly!");
            return;
        }
        
        const { jsPDF } = window.jspdf; 
        const code = editor.getValue();  
        const analysis = document.getElementById('output').innerText; // Get the analysis
        
        if (analysis) {
            const doc = new jsPDF();
            doc.setFontSize(12);
            
            
            doc.text("Code Snippet:", 10, 10);
            const codeLines = doc.splitTextToSize(code, 180);
            doc.text(codeLines, 10, 20); 

            // Add some space before analysis
            const yPosForAnalysis = 30 + (codeLines.length * 5); 

            // Add Analysis section to PDF
            doc.text("Code Analysis:", 10, yPosForAnalysis);
            const analysisLines = doc.splitTextToSize(analysis, 180);  // Split long analysis
            doc.text(analysisLines, 10, yPosForAnalysis + 10);

            doc.save("code_analysis.pdf");
        } else {
            alert("No analysis to download.");
        }
    });
});
