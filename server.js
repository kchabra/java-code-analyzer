const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config(); 

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/analyze', async (req, res) => {
    const codeSnippet = req.body.code.trim();  

    // Hardcoded C++ code examples
    const example1 = `#include <iostream>
using namespace std;

int main() {
    int a, b, sum;
    cout << "Enter two numbers: ";
    cin >> a >> b;
    sum = a + b;
    cout << "Sum: " << sum << endl;
    return 0;
}`;

    const example2 = `#include <iostream>
using namespace std;

bool isPalindrome(string str) {
    int n = str.length();
    for (int i = 0; i < n / 2; i++) {
        if (str[i] != str[n - i - 1]) {
            return false;
        }
    }
    return true;
}

int main() {
    string str;
    cout << "Enter a string: ";
    cin >> str;

    if (isPalindrome(str)) {
        cout << "The string is a palindrome." << endl;
    } else {
        cout << "The string is not a palindrome." << endl;
    }
    return 0;
}`;

    // Hardcoded detailed analysis
    let analysis;
    if (codeSnippet === example1) {
        analysis = `
        **Time Complexity**: O(1) (constant time complexity as there are no loops).
        
        **Purpose of Code**: This code is a simple C++ program to add two numbers and print the result.
        
        **In-depth Analysis**:
        - The program starts by declaring three integers: \`a\`, \`b\`, and \`sum\`.
        - It prompts the user to input two numbers using \`cin\`, and then computes their sum.
        - The sum is stored in the variable \`sum\` and is output using \`cout\`.
        - The program then returns 0, indicating successful completion.
        
        **Suggestions for Improvement**:
        - Add input validation to ensure the user enters valid numbers.
        - Consider using functions to make the code modular for adding multiple numbers.
        `;
    } else if (codeSnippet === example2) {
        analysis = `
        **Time Complexity**: O(n) (where n is the length of the string).
        
        **Purpose of Code**: This code checks whether a given string is a palindrome (i.e., it reads the same forwards and backwards).
        
        **In-depth Analysis**:
        - The function \`isPalindrome\` takes a string as input and compares the characters from the start and end of the string moving toward the center.
        - If any characters don't match, the function returns false, indicating the string is not a palindrome.
        - If all characters match, the function returns true.
        - In the \`main\` function, the user is prompted to enter a string, which is checked using the \`isPalindrome\` function.
        - The result is printed to the console, either confirming that the string is a palindrome or not.
        
        **Suggestions for Improvement**:
        - Handle edge cases, such as empty strings or single character strings.
        - Improve efficiency by considering case-insensitive comparisons or ignoring spaces in the string.
        `;
    } else {
        analysis = "Failed to analyze the code.";
    }

    res.json({ analysis });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});