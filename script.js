const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter() //criando objeto
    return converter.makeHtml(text) //
}

const perguntarAI = async(question, game, apiKey) => { //async porque vai ter que sair dessa aplicação, esperar uma resposta e receber a resposta //
    const model = "gemini-2.0-flash"; //modelo da AI
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    let pergunta = ''

    const perguntaCS2 = `
    ## Especialidade
    - Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    - Você deve responder as perguntas dos usuários com base no seu conhecimento do jogo, estratégias, smokes, molotovs, entradas rápidas, etc.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está realacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre a atualização atual, baseado na data atual, para dar uma resposta coerente.
    - Lembre-se que o jogo é jogado por 2 times, sendo um terrorista e outro contra-terrorista, os dois times são compostos com 5 jogares
    

    ## Respostas
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
    - Digue exatamente qual jogador deve fazer 


    ## Exemplo de respostas
    - Pergunta do usuário: Qual a melhor tática para entrar no bomb A da mirage sendo terrorista.
    - Resposta: Uma ótima tática é: \n\n**Smokes:**\n\n**Flashes:**\n\n...
    `

    const perguntaLOL = `
        ## Especialidade 
        - Você é um especialista assistente de meta para o jogo ${game}

        ## Tarefa
        - Você deve responder as perguntas dos usuários com base no seu conhecimento do jogo, estratégias, build e dicas
        
        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está realacionada ao jogo'
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda itens que você não tenha certeza de que existe no patch atual.
        
        ## Respostas
        - Economize na resposta, seja direto e responda no máximo 500 caracteres
        - Responda em markdown
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

        ## Exemplo de respostas
        - Pergunta do usuário: Melhor build rengar jungle
        - Resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

        ---
        Aqui está a resposta do usuário: ${question}

    ` //engenharia de prompt | escrever em markdown para especificar melhor para a AI


    //verifica o jogo escolhido para usar a melhor pergunta
    if(game == CSS) { 
        pergunta = perguntaCS2
    } else {
        pergunta = perguntaLOL //padrao utilizado
    }

    const contents = [{ //objeto sem nome | objeto - ex: const celular = {}
        role: "user",
        parts: [{
            text: pergunta
        }]
    }] 


    const tools = [{
        google_search: {}
    }]

    // Chamada API // await -> aguardar informação
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({ //toda chamada http poderá ter um body | stringify - pegar um objeto js e tornar em json
            contents,
            tools //adicionando agente 
        }) 
    })


    //segunda chamada
    const data = await response.json()
    console.log({ data })
    return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async(event) => {
    event.preventDefault() //nao vai atualizar o formulário
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value
    

    if(apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    
    askButton.disabled = true; //destivar o botão quando for clicado
    askButton.textContent = "Perguntando...";
    askButton.classList.add('loading');


    try {
        // perguntar para a AI
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text) //a resposta vai para a classe response-content
        aiResponse.classList.remove('hidden') //removendo hidden para que a resposta apareça quando for recebida
    } catch(error) {
        console.log("Erro: ", error)
    } finally {
        askButton.disabled = false;
        askButton.textContent = "Perguntar";
        askButton.classList.remove('loading');
    }

}

form.addEventListener('submit', enviarFormulario);
