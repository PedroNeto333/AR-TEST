document.addEventListener('DOMContentLoaded', () => {
    // Declaração de todas as variáveis e elementos
    const pages = {
        profile: document.getElementById('page-profile'),
        home: document.getElementById('page-home'),
        form: document.getElementById('page-form'),
        results: document.getElementById('page-results'),
        tips: document.getElementById('page-tips'),
        history: document.getElementById('page-history')
    };

    const enterButton = document.getElementById('enter-button');
    const nameInput = document.getElementById('name-input');
    const startButton = document.getElementById('start-button');
    const formContent = document.getElementById('form-content');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const viewTipsButton = document.getElementById('view-tips-button');
    const whatsappShareButton = document.getElementById('whatsapp-share');
    const telegramShareButton = document.getElementById('telegram-share');
    const backFromTipsButton = document.getElementById('back-from-tips-button');
    const viewHistoryButton = document.getElementById('view-history-button');
    const backFromHistoryButton = document.getElementById('back-from-history-button');
    const restartButton = document.getElementById('restart-button');

    let currentStep = 0;
    let answers = {};
    const questions = [
        {
            type: 'text',
            label: 'Idade',
            id: 'age',
            placeholder: 'Ex: 35'
        },
        {
            type: 'radio',
            label: 'Sexo',
            id: 'sex',
            options: ['Masculino', 'Feminino']
        },
        {
            type: 'radio',
            label: 'Tabagismo',
            id: 'smoking',
            options: ['Não', 'Sim, atualmente', 'Sim, parei']
        },
        {
            type: 'radio',
            label: 'Consumo de álcool',
            id: 'alcohol',
            options: ['Nenhum', 'Ocasional', 'Frequente']
        },
        {
            type: 'radio',
            label: 'Atividade física',
            id: 'physical_activity',
            options: ['Baixa', 'Média', 'Alta']
        },
        {
            type: 'radio',
            label: 'Parente de 1º grau com câncer',
            id: 'family_history',
            options: ['Sim', 'Não']
        },
    ];
    const totalSteps = questions.length;

    // Lógica inicial para mostrar a tela de perfil
    showPage('page-profile');

    // Funções de navegação e lógica da avaliação
    function showPage(pageId) {
        for (const key in pages) {
            pages[key].classList.add('hidden');
        }
        document.getElementById(pageId).classList.remove('hidden');
    }

    function renderStep() {
        if (currentStep < totalSteps) {
            const questionData = questions[currentStep];
            let content = `<h2 class="question-text">${questionData.label}</h2>`;

            if (questionData.type === 'text') {
                content += `
                    <div class="form-field">
                        <input type="number" id="${questionData.id}" placeholder="${questionData.placeholder}" class="input-field">
                    </div>
                `;
            } else if (questionData.type === 'radio') {
                content += questionData.options.map(option => `
                    <button class="option-button" data-value="${option}">${option}</button>
                `).join('');
            }

            content += `<div class="button-group-nav">`;
            if (currentStep > 0) {
                content += `<button class="button button-secondary back-button">Voltar</button>`;
            }
            content += `<button class="button next-button">Próxima</button>`;
            content += `</div>`;

            formContent.innerHTML = content;
            updateProgressBar();
            attachFormListeners(questionData);
        } else {
            showResult();
        }
    }

    function attachFormListeners(questionData) {
        const nextButton = document.querySelector('.next-button');
        const backButton = document.querySelector('.back-button');
        const options = document.querySelectorAll('.option-button');
        let selectedValue = null;

        if (backButton) {
            backButton.addEventListener('click', () => {
                currentStep--;
                renderStep();
            });
        }

        if (questionData.type === 'radio') {
            nextButton.style.display = 'none';
            options.forEach(option => {
                option.addEventListener('click', () => {
                    options.forEach(btn => btn.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedValue = option.dataset.value;
                    nextButton.style.display = 'block';
                });
            });
        }

        nextButton.addEventListener('click', () => {
            if (questionData.type === 'text') {
                const inputField = document.getElementById(questionData.id);
                if (inputField) {
                    selectedValue = inputField.value;
                }
            }
            if (selectedValue) {
                answers[questionData.id] = selectedValue;
                currentStep++;
                renderStep();
            }
        });
    }

    function updateProgressBar() {
        const progress = (currentStep / totalSteps) * 100;
        progressBarFill.style.width = `${progress}%`;
    }

    function calculateRisk() {
        let riskScore = 0;
        if (answers.age > 50) riskScore += 2;
        if (answers.smoking !== 'Não') riskScore += 3;
        if (answers.alcohol !== 'Nenhum') riskScore += 1;
        if (answers.family_history === 'Sim') riskScore += 4;

        if (riskScore >= 7) return 'high';
        if (riskScore >= 4) return 'moderate';
        return 'low';
    }

    // Função principal para exibir o resultado
    function showResult() {
        const riskLevel = calculateRisk();
        const resultText = document.getElementById('result-text');
        const resultDescription = document.getElementById('result-description');
        const pageResults = document.getElementById('page-results');

        let message = "";
        let classToAdd = "";
        let iconText = "";

        // Remove classes de risco anteriores para garantir a cor correta
        pageResults.classList.remove('low-risk', 'moderate-risk', 'high-risk');

        if (riskLevel === 'low') {
            message = "De acordo com minhas respostas, meu risco estimado é **baixo**.";
            iconText = "Baixo";
            classToAdd = "low-risk";
        } else if (riskLevel === 'moderate') {
            message = "De acordo com minhas respostas, meu risco estimado é **moderado**.";
            iconText = "Moderado";
            classToAdd = "moderate-risk";
        } else {
            message = "De acordo com minhas respostas, meu risco estimado é **alto**.";
            iconText = "Alto";
            classToAdd = "high-risk";
        }

        // Salva o resultado no histórico
        saveResult(riskLevel);

        showPage('page-results');
        pageResults.classList.add(classToAdd);
        resultText.innerText = iconText;
        resultDescription.innerHTML = message + "<br><br>Recomendamos que consulte um médico para avaliação detalhada.";

        const shareMessage = `Minha autoavaliação de risco de câncer indicou um resultado ${iconText}. Faça a sua avaliação e cuide da sua saúde em: ${window.location.href}`;
        const encodedMessage = encodeURIComponent(shareMessage);

        whatsappShareButton.href = `https://wa.me/?text=${encodedMessage}`;
        telegramShareButton.href = `https://t.me/share/url?url=${window.location.href}&text=${encodedMessage}`;

        lucide.createIcons();
    }

    // Funcionalidades de Histórico e Gamificação
    function saveResult(riskLevel) {
        let history = JSON.parse(localStorage.getItem('cancerRiskHistory')) || [];
        const result = {
            date: new Date().toISOString(),
            riskLevel: riskLevel
        };
        history.push(result);
        localStorage.setItem('cancerRiskHistory', JSON.stringify(history));
    }

    function showHistoryPage() {
        const history = JSON.parse(localStorage.getItem('cancerRiskHistory')) || [];
        const historyContent = document.getElementById('history-content');
        if (history.length === 0) {
            historyContent.innerHTML = '<p class="subtitle">Você ainda não fez nenhuma avaliação. Faça sua primeira agora!</p>';
        } else {
            let list = '<ul class="tips-list">';
            history.reverse().forEach(item => {
                const date = new Date(item.date).toLocaleDateString('pt-BR');
                const riskClass = item.riskLevel + '-risk';
                list += `
                    <li>
                        <i data-lucide="calendar"></i>
                        Avaliação de ${date}: <span class="history-risk-text ${riskClass}">${item.riskLevel.toUpperCase()}</span>
                    </li>`;
            });
            list += '</ul>';
            historyContent.innerHTML = list;
        }
    }
    
    // Lógica de Dark Mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark-mode') {
        document.body.classList.add('dark-mode');
        darkModeIcon.setAttribute('data-lucide', 'sun');
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark-mode');
            darkModeIcon.setAttribute('data-lucide', 'sun');
        } else {
            localStorage.setItem('theme', 'light-mode');
            darkModeIcon.setAttribute('data-lucide', 'moon');
        }
        lucide.createIcons();
    });

    // Event listeners dos botões
    enterButton.addEventListener('click', () => {
        const userName = nameInput.value;
        if (userName.trim() !== '') {
            showPage('page-home');
        } else {
            alert('Por favor, digite seu nome para continuar.');
        }
    });

    startButton.addEventListener('click', () => {
        currentStep = 0; // Reinicia a avaliação
        answers = {}; // Limpa as respostas
        showPage('page-form');
        renderStep();
    });

    restartButton.addEventListener('click', () => {
        currentStep = 0;
        answers = {};
        showPage('page-form');
        renderStep();
    });

    viewTipsButton.addEventListener('click', () => {
        showPage('page-tips');
        lucide.createIcons();
    });

    backFromTipsButton.addEventListener('click', () => {
        showPage('page-results');
    });
    
    viewHistoryButton.addEventListener('click', () => {
        showHistoryPage();
        showPage('page-history');
        lucide.createIcons();
    });

    backFromHistoryButton.addEventListener('click', () => {
        showPage('page-results');
    });

    lucide.createIcons();
});