# Gmail Login Flow

This project implements a Gmail-like login flow with the following steps:
1. Email input page
2. Password input page
3. Two-factor authentication method selection (SMS or Google Authenticator)
4. Phone number input (if SMS is selected)
5. Verification code input
6. Login success page

## Features

- Modern dark mode UI resembling Gmail's login interface
- Client-side validation for email, password, and verification code
- Multi-step login process
- Responsive design that works on mobile and desktop
- Keyboard support (can use Enter key to navigate)

## How to Use

1. Open `index.html` in a web browser
2. Enter any valid email address format in the first screen
3. Click "Next" or press Enter
4. Enter a password (must be at least 8 characters)
5. Click "Next" or press Enter
6. Choose a verification method:
   - If you select "Text message (SMS)", you'll be asked to enter a phone number
   - If you select "Google Authenticator", you'll go directly to the verification code screen
7. Enter a 6-digit verification code
8. Click "Verify" or press Enter
9. View the successful login screen

## Technical Implementation

- Pure HTML, CSS, and JavaScript
- No external dependencies or frameworks required
- Client-side form validation
- Step-by-step navigation logic

## Note

This is a front-end implementation only, with no actual authentication. In a real-world application, you would need to integrate this with a backend service for actual user authentication.

## Files

- `index.html` - The HTML structure of the login flow
- `styles.css` - The styling for the login interface
- `script.js` - The JavaScript code for handling the login flow logic
