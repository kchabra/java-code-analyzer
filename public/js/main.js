document.addEventListener('DOMContentLoaded', function () {
    // Analyze button functionality
    document.getElementById('analyzeBtn').addEventListener('click', async () => {
        const code = document.getElementById('codeInput').value;
        
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
    });

    // Clear code functionality
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('codeInput').value = "";
        document.getElementById('output').innerText = ""; // Clear the analysis output as well
    });

    // Download analysis as PDF
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const { jsPDF } = window.jspdf;  
        const analysis = document.getElementById('output').innerText;
        
        if (analysis) {
            const doc = new jsPDF();
            doc.setFontSize(12);  // Set font size
            const lines = doc.splitTextToSize(analysis, 180);  
            doc.text(lines, 10, 10);
            doc.save("code_analysis.pdf");
        } else {
            alert("No analysis to download.");
        }
    });
});