$(document).ready(function() {
    const textInput = $('#textInput');
    const sendButton = $('#sendButton');
    const chatArea = $('#chatArea');
    const fileInput = $('#fileInput');

    sendButton.on('click', async function(event) {
        event.preventDefault(); // Prevent default form submission

        const message = textInput.val().trim();
        const file = fileInput.prop('files')[0];

        if (message === '' && !file) return;

        if (file) {
            sendMessageWithFile(file);
            fileInput.val(null); // Clear the file input after sending
        } else {
            sendMessage(message);
        }

        textInput.val(''); // Clear text input after sending message
    });

    // Event listener for clear button
    $('#clearButton').on('click', function() {
        chatArea.empty(); // Clear all messages in chat area
    });

    // Event listener for Enter key press
    textInput.on('keydown', function(event) {
        if (event.keyCode === 13 && !event.shiftKey) { // Enter key without Shift
            sendButton.click(); // Simulate click on send button
        }
    });

    // Function to get current time in HH:mm format
    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Update appendMessage function to include timestamps
    function appendMessage(role, content) {
        const currentTime = getCurrentTime();
        let messageHtml = `<div class="message ${role}">`;

        if (role === 'user') {
            messageHtml += `<div class="message-content">${content}</div>`;
        } else if (role === 'bot') {
            messageHtml += `<div class="message-content">${content}</div>`;
        } else if (role === 'file') {
            messageHtml += `<div class="message-content"><a href="${content.url}" target="_blank">${content.name}</a></div>`;
        }

        messageHtml += `<div class="message-time">${currentTime}</div></div>`;
        chatArea.append(messageHtml);
        chatArea.scrollTop(chatArea.prop('scrollHeight'));
    }

    // Event listener for emoji button
    $('#emojiButton').on('click', function() {
        textInput.val(textInput.val() + '😊'); // Append emoji to input field
    });

    // Event listener for help button
    $('#helpButton').on('click', function() {
        sendMessage('ℹ️ Help requested!');
        appendMessage('user', 'ℹ️ Help requested!');
        appendMessage('bot', 'ℹ️ You can type messages, click Send, or use the file upload button to share files.');
    });

    // Keep track of context between messages
    let context = '';

    async function sendMessage(message) {
        const url = 'https://chatgpt-42.p.rapidapi.com/conversationgpt4-2';
        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': 'a61f847f35msheb84fb312d1437ep11ecacjsn84a97c56abbf',
                'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: message,
                    context: context // Include context from previous messages
                }],
                system_prompt: '',
                temperature: 0.9,
                top_k: 5,
                top_p: 0.9,
                max_tokens: 256,
                web_access: false
            })
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json(); // Assuming response is JSON
            console.log('API Response:', data);

            if (data && data.result) {
                appendMessage('user', message);
                appendMessage('bot', data.result);
                context = data.context; // Update context for next message
            } else {
                console.error('No valid messages found in API response:', data);
            }
        } catch (error) {
            console.error('API request failed:', error);
            showError('Failed to connect to ChatGPT. Please try again later.');
        }
    }

    async function sendMessageWithFile(file) {
        try {
            // Simulate file upload (replace with actual upload logic)
            const uploadResponse = await uploadFileToServer(file);
            const fileUrl = uploadResponse.url;
            const fileName = uploadResponse.name;

            // Send message with file reference
            const message = `File shared: ${fileName}`;
            const url = 'https://chatgpt-42.p.rapidapi.com/conversationgpt4-2';
            const options = {
                method: 'POST',
                headers: {
                    'x-rapidapi-key': 'f37b1faffdmshae09f2311bb9e63p1078f1jsn42333711159b',
                    'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: message,
                        context: context // Include context from previous messages
                    }],
                    system_prompt: '',
                    temperature: 0.9,
                    top_k: 5,
                    top_p: 0.9,
                    max_tokens: 256,
                    web_access: false
                })
            };

            const response = await fetch(url, options);
            const data = await response.json(); // Assuming response is JSON
            console.log('API Response:', data);

            if (data && data.result) {
                appendMessage('user', message);
                appendMessage('bot', data.result);
                context = data.context; // Update context for next message
            } else {
                console.error('No valid messages found in API response:', data);
            }
        } catch (error) {
            console.error('Error sending message with file:', error);
            showError('Failed to send file. Please try again later.');
        }
    }

    // Function to simulate file upload (replace with actual upload logic)
    function uploadFileToServer(file) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate server response with file details
                const fileDetails = {
                    url: `https://example.com/files/${file.name}`,
                    name: file.name
                };
                resolve(fileDetails);
            }, 2000); // Simulate 2 second delay for upload process
        });
    }

    // Function to display error messages
    function showError(message) {
        const errorHtml = `<div class="message error">${message}</div>`;
        chatArea.append(errorHtml);
        chatArea.scrollTop(chatArea.prop('scrollHeight'));
    }

    // Optional: Initialize with a welcome message
    sendMessage('Hello, ChatGPT!');
});
