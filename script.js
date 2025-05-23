document.addEventListener('DOMContentLoaded', () => {
    // DOM元素
    const loginButton = document.getElementById('loginButton');
    const refreshPromptsButton = document.getElementById('refreshPrompts');
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    const introSection = document.querySelector('.intro-section');
    const responseContainer = document.getElementById('responseContainer');
    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const closeChat = document.getElementById('closeChat');

    // Example questions
    const exampleQuestions = [
        {
            title: "Creative Writing",
            question: "Can you help me write a short story about a space adventure?"
        },
        {
            title: "Technical Help",
            question: "How do I optimize my website's loading speed?"
        },
        {
            title: "Language Learning",
            question: "What are some effective ways to improve my English vocabulary?"
        },
        {
            title: "Career Advice",
            question: "What skills should I learn to become a data scientist?"
        },
        {
            title: "Problem Solving",
            question: "How can I improve my critical thinking skills?"
        },
        {
            title: "Health & Wellness",
            question: "What are some effective stress management techniques?"
        },
        {
            title: "Business Strategy",
            question: "How can I create an effective marketing plan for my startup?"
        },
        {
            title: "Personal Growth",
            question: "How can I develop better time management habits?"
        }
    ];

    // Chat conversation history
    let conversationHistory = [];

    // Initialize icons
    initializeIcons();

    if (userInput) {
        userInput.addEventListener('input', autoResizeTextarea);
        setTimeout(autoResizeTextarea, 0);
        setTimeout(() => userInput.focus(), 500);
    }

    function autoResizeTextarea() {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    }

    if (refreshPromptsButton) {
        refreshPromptsButton.addEventListener('click', () => {
            setButtonLoading(refreshPromptsButton, true);
            setTimeout(() => {
                setButtonLoading(refreshPromptsButton, false);
                shuffleAndDisplayCards();
            }, 300);
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (userInput) {
        userInput.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    if (closeChat) {
        closeChat.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });
    }

    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.add('active');
            setTimeout(() => {
                card.classList.remove('active');
                const question = card.querySelector('p')?.textContent || card.querySelector('h3')?.textContent;
                if (question) {
                    window.location.href = `chat.html?query=${encodeURIComponent(question)}`;
                }
            }, 150);
        });
    });

    function sendMessage() {
        if (!userInput) return;

        const message = userInput.value.trim();
        if (message) {
            window.location.href = `chat.html?query=${encodeURIComponent(message)}`;
        } else {
            userInput.classList.add('shake');
            setTimeout(() => userInput.classList.remove('shake'), 500);
        }
    }

    function formatAIResponse(text) {
        if (!text) return '';
        return text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    function setButtonLoading(button, isLoading) {
        if (!button) return;
        
        const originalContent = button.getAttribute('data-original-content') || button.innerHTML;
        
        if (isLoading) {
            button.setAttribute('data-original-content', originalContent);
            button.disabled = true;
            button.innerHTML = '<div class="loading-spinner"></div>';
        } else {
            button.innerHTML = originalContent;
            button.disabled = false;
        }
    }

    function shuffleAndDisplayCards() {
        const allCards = Array.from(suggestionCards);
        const suggestionsGrid = document.querySelector('.suggestions-grid');

        suggestionsGrid.style.opacity = '0';

        setTimeout(() => {
            const shuffledQuestions = [...exampleQuestions].sort(() => Math.random() - 0.5);

            allCards.forEach(card => {
                card.style.display = 'none';
                card.style.animation = 'none';
                for (let i = 1; i <= 12; i++) {
                    card.classList.remove(`icon-${i}`);
                }
            });

            shuffledQuestions.slice(0, 6).forEach((question, index) => {
                if (allCards[index]) {
                    const card = allCards[index];
                    card.style.display = '';
                    const titleElement = card.querySelector('h3') || card.querySelector('h4');
                    const questionElement = card.querySelector('p');
                    
                    if (titleElement) titleElement.textContent = question.title;
                    if (questionElement) questionElement.textContent = question.question;
                    
                    const randomIconNum = Math.floor(Math.random() * 12) + 1;
                    card.classList.add(`icon-${randomIconNum}`);
                    
                    setTimeout(() => {
                        card.style.animation = `cardFadeIn 0.5s ease forwards ${index * 0.1}s`;
                    }, 10);
                }
            });

            suggestionsGrid.style.opacity = '1';
            suggestionsGrid.style.transition = 'opacity 0.5s ease';
        }, 300);
    }

    shuffleAndDisplayCards();
});