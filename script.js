document.addEventListener('DOMContentLoaded', () => {
    const pages = {
        home: document.getElementById('page-home'),
        form: document.getElementById('page-form'),
        results: document.getElementById('page-results'),
        tips: document.getElementById('page-tips')
    };

    // Variáveis que precisam ser acessadas por várias funções
    const startButton = document.getElementById('start-button');
    const formContent = document.getElementById('form-content');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const viewTipsButton = document.getElementById('view-tips-button');
    const whatsappShareButton = document.getElementById('whatsapp-share');
    const telegramShareButton = document.getElementById('telegram-share');
    const backFromTipsButton = document.getElementById('back-from-tips-button'); // Adicionado
    
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

    // Função para mostrar uma página e esconder as outras
    function showPage(pageId) {
        for (const key in pages) {
            pages[key].classList.add('hidden');
        }
        document.getElementById(pageId).classList.remove('hidden');
    }

    // Função para gerar o formulário da etapa atual
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

    // Anexar ouvintes de eventos
    function attachFormListeners(questionData) {
        const nextButton = document.querySelector('.next-button');
        const backButton = document.querySelector('.back-button');
        const options = document.querySelectorAll('.option-button');
        let selectedValue = null;
        
        // Adiciona o event listener para o botão de voltar
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

    // Atualizar barra de progresso
    function updateProgressBar() {
        const progress = (currentStep / totalSteps) * 100;
        progressBarFill.style.width = `${progress}%`;
    }

    // Lógica para calcular o risco
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

    // Exibir a tela de resultados
    function showResult() {
        const riskLevel = calculateRisk();
        const resultText = document.getElementById('result-text');
        const resultDescription = document.getElementById('result-description');
        const resultIcon = document.getElementById('result-icon');
        
        let message = "";
        let classToAdd = "";
        let iconText = "";

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

        showPage('page-results');
        document.getElementById('page-results').classList.add(classToAdd);
        resultText.innerText = iconText;
        resultDescription.innerHTML = message + "<br><br>Recomendamos que consulte um médico para avaliação detalhada.";

        const shareMessage = `Minha autoavaliação de risco de câncer indicou um resultado ${iconText}. Faça a sua avaliação e cuide da sua saúde em: ${window.location.href}`;
        const encodedMessage = encodeURIComponent(shareMessage);
        
        whatsappShareButton.href = `https://wa.me/?text=${encodedMessage}`;
        telegramShareButton.href = `https://t.me/share/url?url=${window.location.href}&text=${encodedMessage}`;
        
        lucide.createIcons();
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

    // Anexar listeners de clique aos botões de navegação
startButton.addEventListener('click', () => {
    showPage('page-form');
    renderStep();
});

viewTipsButton.addEventListener('click', () => {
    showPage('page-tips');
    lucide.createIcons();
});

// Adicionado: Botão para voltar da página de dicas para a de resultados
backFromTipsButton.addEventListener('click', () => {
    showPage('page-results');
    // Opcional: Aqui você pode renderizar novamente a página de resultados se necessário
    // mas a sua lógica atual já a deixa pronta.
});

lucide.createIcons();
});

document.addEventListener('DOMContentLoaded', () => {
    const pages = {
        profile: document.getElementById('page-profile'), // Adicionado
        home: document.getElementById('page-home'),
        form: document.getElementById('page-form'),
        results: document.getElementById('page-results'),
        tips: document.getElementById('page-tips')
    };
    
    // Variáveis que precisam ser acessadas por várias funções
    const enterButton = document.getElementById('enter-button'); // Adicionado
    const nameInput = document.getElementById('name-input'); // Adicionado
    const startButton = document.getElementById('start-button');
    const formContent = document.getElementById('form-content');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    const viewTipsButton = document.getElementById('view-tips-button');
    const whatsappShareButton = document.getElementById('whatsapp-share');
    const telegramShareButton = document.getElementById('telegram-share');
    const backFromTipsButton = document.getElementById('back-from-tips-button');
    
    let currentStep = 0;
    let answers = {};
    const questions = [
        {
            type: 'text',
            label: 'Idade',
            id: 'age',
            placeholder: 'Ex: 35'
        },
        // ... (restante das suas perguntas) ...
        {
            type: 'radio',
            label: 'Parente de 1º grau com câncer',
            id: 'family_history',
            options: ['Sim', 'Não']
        },
    ];
    const totalSteps = questions.length;
    
    // Lógica para mostrar a tela de perfil primeiro
    showPage('page-profile');
    
    // ... (suas funções showPage, renderStep, etc.) ...
    
    // Adicionado: Event listener para o botão de "Entrar"
    enterButton.addEventListener('click', () => {
        const userName = nameInput.value;
        if (userName.trim() !== '') {
            showPage('page-home');
        } else {
            alert('Por favor, digite seu nome para continuar.');
        }
    });

    // Anexar listeners de clique aos botões de navegação
    startButton.addEventListener('click', () => {
        showPage('page-form');
        renderStep();
    });
    
    // ... (resto do seu código, incluindo os listeners de viewTipsButton, etc.) ...

    lucide.createIcons();
});