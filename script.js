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
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.classList.add('listening'); // Add animation
        micBtn.textContent = 'Listening...';
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        addMessage(transcript, 'user-message');
        micBtn.classList.remove('listening'); // Remove animation
        micBtn.textContent = '🎤 Speak';
        sendToChatbot(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        micBtn.classList.remove('listening');
        micBtn.textContent = '🎤 Speak';
        alert('Error: ' + event.error);
    };

    recognition.onspeechend = () => {
        recognition.stop();
        micBtn.classList.remove('listening');
        micBtn.textContent = '🎤 Speak';
    };
}

// Event listener for send button (typing input)
sendBtn.addEventListener('click', () => {
    const userInput = textInput.value.trim();
    if (userInput) {
        addMessage(userInput, 'user-message');
        sendToChatbot(userInput);
        textInput.value = '';
    }
});

// Function to add a message to the chat output
function addMessage(text, className) {
    const message = document.createElement('p');
    message.classList.add('message', className);
    message.innerHTML = `<strong>${className === 'user-message' ? 'You' : 'Bot'}:</strong> ${text}`;
    chatOutput.appendChild(message);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Function to send user input to Hugging Face API
async function sendToChatbot(userInput) {
    console.log('User Input:', userInput);

    // Show typing effect
    const typingIndicator = document.createElement('p');
    typingIndicator.classList.add('typing');
    typingIndicator.innerText = 'Bot is typing...';
    chatOutput.appendChild(typingIndicator);
    chatOutput.scrollTop = chatOutput.scrollHeight;

    // Show loading spinner
    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: userInput }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        const botReply = data[0].generated_text;
        typingIndicator.remove(); // Remove typing effect
        typeMessage(botReply, 'bot-message'); // Show bot message with typing effect
        speak(botReply);
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        addMessage(`Error: ${error.message}`, 'bot-message');
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Function to display bot messages with typing animation
function typeMessage(text, className) {
    const message = document.createElement('p');
    message.classList.add('message', className);
    message.innerHTML = `<strong>Bot:</strong> `;

    chatOutput.appendChild(message);
    chatOutput.scrollTop = chatOutput.scrollHeight;

    let i = 0;
    function typeCharacter() {
        if (i < text.length) {
            message.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeCharacter, 30);
        }
    }
    typeCharacter();
}

// Text-to-Speech
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}
