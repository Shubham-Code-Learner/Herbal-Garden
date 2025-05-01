// Hardcoded valid credentials
const SAVED_CREDENTIALS = {
    email: "herbal@example.com",
    password: "123456"
};

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const enteredEmail = document.getElementById('email').value;
    const enteredPassword = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    if (enteredEmail === SAVED_CREDENTIALS.email && 
        enteredPassword === SAVED_CREDENTIALS.password) {
        // Successful login - redirect to main page
        window.location.href = "homelander.html"; // Change to your target page
    } else {
        // Show error message
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
});

// Keep existing overlay animation code if needed
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});