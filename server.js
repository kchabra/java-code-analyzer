const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Handle POST request for code analysis
app.post('/analyze', (req, res) => {
    const { code, explanationType, visualOutput } = req.body;

    // Hardcoded Java examples
    const example1 = `public class SumCalculator {
    public static void main(String[] args) {
        int a = 5, b = 10;
        int sum = a + b;
        System.out.println("The sum is: " + sum);
    }
}`;

    const example2 = `public class PalindromeChecker {
    public static boolean isPalindrome(String str) {
        int n = str.length();
        for (int i = 0; i < n / 2; i++) {
            if (str.charAt(i) != str.charAt(n - i - 1)) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        String str = "madam";
        boolean result = isPalindrome(str);
        System.out.println("Is the string a palindrome? " + result);
    }
}`;

    let analysis = '';
    let visualAnalysis = '';

    // High-level and detailed explanations with visual analysis
    if (code.trim() === example1) {
        if (explanationType === 'high') {
            analysis = `
            <h3>Sum Calculator Analysis</h3>
            <ul>
                <li><strong>Purpose:</strong> Computes the sum of two integers and prints the result.</li>
                <li><strong>Explanation:</strong>
                    <ul>
                        <li>Declares two integer variables <code>a</code> and <code>b</code> with values 5 and 10.</li>
                        <li>Adds the two integers and stores the result in <code>sum</code>.</li>
                        <li>Prints the sum to the console using <code>System.out.println</code>.</li>
                    </ul>
                </li>
                <li><strong>Suggestions:</strong> Expand functionality to allow dynamic user input for the integers.</li>
            </ul>
            `;
            visualAnalysis = `
            <h3>High-Level Flowchart: Sum Calculator</h3>
            <img src="/images/high_level_sum_calculator.png" alt="High-Level Sum Calculator Flowchart" style="width: 100%; max-width: 400px; height: auto; margin-top: 10px;">
            `;
        } else if (explanationType === 'detailed') {
            analysis = `
            <h3>Sum Calculator Detailed Analysis</h3>
            <ul>
                <li><strong>Line 1:</strong> <code>public class SumCalculator</code> - Declares the class <code>SumCalculator</code> as public so it can be accessed by other classes.</li>
                <li><strong>Line 2:</strong> <code>public static void main(String[] args)</code> - Main method that serves as the entry point of the program.</li>
                <li><strong>Line 3:</strong> <code>int a = 5, b = 10;</code> - Declares and initializes two integer variables, <code>a</code> and <code>b</code>, with values 5 and 10.</li>
                <li><strong>Line 4:</strong> <code>int sum = a + b;</code> - Computes the sum of <code>a</code> and <code>b</code> and assigns the result to the variable <code>sum</code>.</li>
                <li><strong>Line 5:</strong> <code>System.out.println("The sum is: " + sum);</code> - Prints the calculated sum to the console.</li>
                <li><strong>Suggestions:</strong> Replace hardcoded values with user input using <code>Scanner</code> for more flexibility.</li>
            </ul>
            `;
            visualAnalysis = `
            <h3>Detailed Flowchart: Sum Calculator</h3>
            <img src="/images/detailed_sum_calculator.png" alt="Detailed Sum Calculator Flowchart" style="width: 100%; max-width: 400px; height: auto; margin-top: 10px;">
            `;
        }
    } else if (code.trim() === example2) {
        if (explanationType === 'high') {
            analysis = `
            <h3>Palindrome Checker Analysis</h3>
            <ul>
                <li><strong>Purpose:</strong> Checks whether a string is a palindrome (reads the same forwards and backwards).</li>
                <li><strong>Explanation:</strong>
                    <ul>
                        <li>Uses a helper function <code>isPalindrome()</code> that compares characters from the start and end of the string.</li>
                        <li>Iterates through half of the string to check for mismatched characters.</li>
                        <li>Main method tests the function with a hardcoded input <code>"madam"</code>.</li>
                    </ul>
                </li>
                <li><strong>Suggestions:</strong> Allow user input for broader functionality and handle edge cases like empty strings.</li>
            </ul>
            `;
            visualAnalysis = `
            <h3>High-Level Flowchart: Palindrome Checker</h3>
            <img src="/images/high_level_palindrome_checker.png" alt="High-Level Palindrome Checker Flowchart" style="width: 100%; max-width: 400px; height: auto; margin-top: 10px;">
            `;
        } else if (explanationType === 'detailed') {
            analysis = `
            <h3>Palindrome Checker Detailed Analysis</h3>
            <ul>
                <li><strong>Line 1:</strong> <code>public class PalindromeChecker</code> - Declares the class <code>PalindromeChecker</code> as public for accessibility.</li>
                <li><strong>Line 2:</strong> <code>public static boolean isPalindrome(String str)</code> - Defines a method that takes a string input and returns a boolean indicating whether the string is a palindrome.</li>
                <li><strong>Line 3:</strong> <code>int n = str.length();</code> - Determines the length of the input string.</li>
                <li><strong>Line 4:</strong> <code>for (int i = 0; i < n / 2; i++)</code> - Iterates over the first half of the string.</li>
                <li><strong>Line 5:</strong> <code>if (str.charAt(i) != str.charAt(n - i - 1))</code> - Compares characters from the start and end of the string.</li>
                <li><strong>Line 6:</strong> <code>return false;</code> - Returns false if a mismatch is found.</li>
                <li><strong>Line 7:</strong> <code>return true;</code> - Returns true if no mismatches are found.</li>
                <li><strong>Suggestions:</strong> Enhance the program to handle special characters, spaces, and case-insensitivity.</li>
            </ul>
            `;
            visualAnalysis = `
            <h3>Detailed Flowchart: Palindrome Checker</h3>
            <img src="/images/detailed_palindrome_checker.png" alt="Detailed Palindrome Checker Flowchart" style="width: 100%; max-width: 400px; height: auto; margin-top: 10px;">
            `;
        }
    } else {
        analysis = '<p>Failed to analyze the code. Please try again with a valid example.</p>';
        visualAnalysis = '';
    }

    res.json({ analysis, visualAnalysis });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
