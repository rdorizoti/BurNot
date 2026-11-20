const formulario = document.querySelector("form");
const inputNome = document.getElementById("nome");
const inputEmail = document.getElementById("email");
const inputSenha = document.getElementById("senha");
const inputConfirmar = document.getElementById("confirmarSenha") || document.getElementById("confirmar");
const checkboxTermos = document.querySelector('input[type="checkbox"]');
const botoesOlho = document.querySelectorAll(".btn-olho, .toggle-senha, button[data-alvo]");

botoesOlho.forEach((botao) => {
    botao.addEventListener("click", () => {
        const idAlvo = botao.getAttribute("data-alvo");
        const campo = idAlvo ? document.getElementById(idAlvo) : botao.parentElement.querySelector("input");
        if (!campo) return;

        campo.type = campo.type === "password" ? "text" : "password";
    });
});

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = inputNome ? inputNome.value.trim() : "";
    const email = inputEmail ? inputEmail.value.trim() : "";
    const senha = inputSenha ? inputSenha.value : "";
    const confirmar = inputConfirmar ? inputConfirmar.value : senha;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    if (senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    if (senha !== confirmar) {
        alert("As senhas digitadas não coincidem.");
        return;
    }

    if (checkboxTermos && !checkboxTermos.checked) {
        alert("Você precisa aceitar os Termos de Uso.");
        return;
    }

    const botaoSubmit = formulario.querySelector('button[type="submit"]');
    const textoOriginal = botaoSubmit ? botaoSubmit.textContent : "";

    try {
        if (botaoSubmit) {
            botaoSubmit.disabled = true;
            botaoSubmit.textContent = "Salvando no banco...";
        }

        const resposta = await fetch("/cadastro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert("Erro: " + (dados.erro || "Não foi possível cadastrar."));
            return;
        }

        alert("✅ Usuário salvo com sucesso no MySQL!");
        formulario.reset();
    } catch (erro) {
        alert("❌ Erro ao conectar com o servidor. Veja se o node server.js está rodando.");
    } finally {
        if (botaoSubmit) {
            botaoSubmit.disabled = false;
            botaoSubmit.textContent = textoOriginal;
        }
    }
});