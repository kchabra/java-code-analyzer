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

        // Add change listener for code stats
        editor.onDidChangeModelContent(() => {
            updateCodeStats();
        });
    });

    // Function to calculate code complexity
    function calculateComplexity(code) {
        let complexity = 0;
        const patterns = {
            loops: /(for|while|do)\s*\(/g,
            conditionals: /(if|switch|catch)\s*\(/g,
            methods: /\b(public|private|protected)\s+[\w<>[\]]+\s+\w+\s*\(/g,
            recursion: /\w+\s*\([^)]*\)\s*{[^}]*\1\s*\(/g
        };

        // Weight different patterns
        complexity += (code.match(patterns.loops) || []).length * 2;
        complexity += (code.match(patterns.conditionals) || []).length * 1.5;
        complexity += (code.match(patterns.methods) || []).length;
        complexity += (code.match(patterns.recursion) || []).length * 3;

        // Normalize to 0-100 scale
        return Math.min(Math.round((complexity / 20) * 100), 100);
    }

    // Function to update code statistics
    function updateCodeStats() {
        const code = editor.getValue();
        const lines = code.split('\n').length;
        const complexity = calculateComplexity(code);
        
        // Update line count
        document.querySelector('.length-value').textContent = `${lines} lines`;
        
        // Update complexity meter
        const complexityLevel = document.querySelector('.complexity-level');
        complexityLevel.style.width = `${complexity}%`;
        
        // Update complexity color based on level
        if (complexity < 30) {
            complexityLevel.style.backgroundColor = '#28a745';
        } else if (complexity < 70) {
            complexityLevel.style.backgroundColor = '#ffc107';
        } else {
            complexityLevel.style.backgroundColor = '#dc3545';
        }
    }

    // Function to calculate estimated time based on code complexity
    function calculateEstimatedTime(code) {
        const complexity = calculateComplexity(code);
        const baseTime = 2;
        const complexityFactor = complexity / 20;
        return Math.max(Math.ceil(baseTime + complexityFactor), 2);
    }

    // Function to update progress bar and timer
    function updateProgress(startTime, totalTime) {
        const progressBar = document.querySelector('.progress-bar');
        const timerElement = document.getElementById('estimatedTime');
        const analysisProgress = document.querySelector('.analysis-progress');
        analysisProgress.style.display = 'block';

        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min((elapsed / totalTime) * 100, 100);
            const remaining = Math.max(Math.ceil(totalTime - elapsed), 0);

            progressBar.style.width = `${progress}%`;
            timerElement.textContent = `Estimated time: ${remaining} seconds`;

            if (elapsed >= totalTime) {
                clearInterval(interval);
                analysisProgress.style.display = 'none';
            }
        }, 100);

        return interval;
    }

    // Function to show/hide loading overlay
    function toggleLoadingOverlay(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    // Copy results functionality
    document.getElementById('copyBtn').addEventListener('click', () => {
        const output = document.getElementById('output').innerText;
        navigator.clipboard.writeText(output).then(() => {
            const copyBtn = document.getElementById('copyBtn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="icon">✓</span> Copied!';
            copyBtn.classList.add('success-animation');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('success-animation');
            }, 2000);
        });
    });

    // Function to render Mermaid diagrams
    function renderMermaidDiagram(container, content) {
        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.innerHTML = content;
        container.innerHTML = '';
        container.appendChild(mermaidDiv);
        mermaid.init(undefined, '.mermaid');
    }

    // Analyze button functionality
    document.getElementById('analyzeBtn').addEventListener('click', async () => {
        const code = editor.getValue();
        const estimatedSeconds = calculateEstimatedTime(code);
        const startTime = Date.now();
        
        // Show loading overlay and progress
        toggleLoadingOverlay(true);
        const progressInterval = updateProgress(startTime, estimatedSeconds);

        try {
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
                    renderMermaidDiagram(visualContainer, data.visualAnalysis);
                } else {
                    visualContainer.style.display = 'none';
                }
            } else {
                document.getElementById('output').innerText = 'Failed to analyze the code.';
            }
        } catch (error) {
            document.getElementById('output').innerText = 'An error occurred during analysis.';
        } finally {
            // Hide loading overlay
            toggleLoadingOverlay(false);
            clearInterval(progressInterval);
            
            // Apply syntax highlighting
            Prism.highlightAll();
        }
    });

    // Clear code functionality
    document.getElementById('clearBtn').addEventListener('click', () => {
        editor.setValue('');
        document.getElementById('output').innerText = '';
        document.getElementById('visual-container').innerHTML = '';
        document.getElementById('visual-container').style.display = 'none';
        document.querySelector('.analysis-progress').style.display = 'none';
        updateCodeStats();
    });

    // PDF Download functionality
    document.getElementById('downloadBtn').addEventListener('click', async () => {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('jsPDF is not loaded properly!');
            return;
        }
    
        const { jsPDF } = window.jspdf;
        const code = editor.getValue();
        const analysis = document.getElementById('output').innerText;
        const visualContainer = document.getElementById('visual-container');
    
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
                const canvas = await html2canvas(visualContainer, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                });
    
                const imgData = canvas.toDataURL('image/png');
                const yPosForVisual = yPosForAnalysis + 10 + analysisLines.length * 5;
                doc.text('Visual Analysis:', 10, yPosForVisual);
                doc.addImage(imgData, 'PNG', 10, yPosForVisual + 10, 180, 80);
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
