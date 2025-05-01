const micBtn = document.getElementById('mic-btn');
const chatOutput = document.getElementById('chat-output');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const loadingSpinner = document.getElementById('loading');

// Check if the browser supports the Web Speech API
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    alert('Your browser does not support the Web Speech API. Please use Google Chrome or Microsoft Edge.');
} else {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US'; // Set to Hindi (or 'en-US' for English)
    recognition.continuous = false; // Stop after one sentence
    recognition.interimResults = false; // Only final results

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.textContent = 'Listening...';
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatOutput.innerHTML += `<p><strong>You:</strong> ${transcript}</p>`;
        micBtn.textContent = '🎤 Speak';
        sendToChatbot(transcript); // Send the transcript to the chatbot
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        micBtn.textContent = '🎤 Speak';
        alert('Error: ' + event.error);
    };

    recognition.onspeechend = () => {
        recognition.stop();
        micBtn.textContent = '🎤 Speak';
    };
}

// Event listener for send button (typing input)
sendBtn.addEventListener('click', () => {
    const userInput = textInput.value.trim();
    if (userInput) {
        chatOutput.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
        sendToChatbot(userInput);
        textInput.value = ''; // Clear input field after sending
    }
});

// Send user input to Hugging Face API
async function sendToChatbot(userInput) {
    console.log('User Input:', userInput);

    // Ensure these exist in your HTML
    const loadingSpinner = document.getElementById('loading');
    const chatOutput = document.getElementById('chat-output');

    // Show loading spinner
    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDbfplCo74-6XzwugUuuSnUmQG3LrvnaDo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: userInput }]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
        chatOutput.innerHTML += `<p><strong>Bot:</strong> ${botReply}</p>`;

        if (typeof speak === 'function') {
            speak(botReply); // Optional: Convert reply to speech
        }

    } catch (error) {
        console.error('Error:', error);
        chatOutput.innerHTML += `<p><strong>Error:</strong> ${error.message}</p>`;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}


// Text-to-Speech
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Set to Hindi (or 'en-US' for English)
    speechSynthesis.speak(utterance);
}
