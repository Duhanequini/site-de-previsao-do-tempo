// constantes para buscar elementos do DOM no HTML
const inputCidade = document.querySelector("#cidade");
const botaoBuscar = document.querySelector("#buscar");
const resultado = document.querySelector("#resultado");


// evento de click do botão buscar
botaoBuscar.addEventListener("click", buscarPrevisao);

// evento de tecla pressionada no input da cidade, se a tecla for "Enter" chama a função buscarPrevisao
inputCidade.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        buscarPrevisao();
    }
});

// função para buscar a previsão do tempo (assíncrona)
async function buscarPrevisao() {

    // constante para pegar o valor do input da cidade
    const cidade = inputCidade.value.trim();

    // validação para verificar se o input da cidade está vazio
    if (cidade === "") {
        resultado.innerHTML = "<p>Digite uma cidade.</p>";
        return;
    }

    try {

        // API de geocoding para buscar a latitude e longitude da cidade
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&countryCode=BR&format=json`;

        // constante para buscar a resposta da API de geocoding
        const resposta = await fetch(url);

        // constante para pegar os dados da resposta da API de geocoding
        const dados = await resposta.json();

        // validação para verificar se a cidade foi encontrada
        if (!dados.results || dados.results.length === 0) {
        resultado.innerHTML = "<p>Cidade não encontrada.</p>";
        return;
        }

        // constantes para pegar dados da cidade, latitude e longitude
        const nomeCidade = dados.results[0].name;
        const latitude = dados.results[0].latitude;
        const longitude = dados.results[0].longitude;

        // API de previsão do tempo com base na latitude e longitude
        const urlPrevisao = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=7&timezone=auto`;
        // constante para buscar a resposta da API de previsão do tempo
        const respostaPrevisao = await fetch(urlPrevisao);

        // constantes para pegar os dados da resposta da API de previsão do tempo
        const dadosPrevisao = await respostaPrevisao.json();
        const datas = dadosPrevisao.daily.time;
        const maximas = dadosPrevisao.daily.temperature_2m_max;
        const minimas = dadosPrevisao.daily.temperature_2m_min;
        const codigosClima = dadosPrevisao.daily.weather_code;

        // constantes para pegar os dados de temperatura, umidade, vento e código do clima para exibir a condição climática
        const temperatura = dadosPrevisao.current.temperature_2m;
        const umidade = dadosPrevisao.current.relative_humidity_2m;
        const vento = dadosPrevisao.current.wind_speed_10m;
        
        // constante para pegar o código do clima, o codigo do clima é um número que representa a condição climática atual, como céu limpo, nublado, chuva, etc.
        const codigoClima = dadosPrevisao.current.weather_code;

        // exibir os dados no HTML
        resultado.innerHTML = `
            <h2>${nomeCidade}</h2>
            <p>🌡️ Temperatura: ${temperatura} °C</p>
            <p>💧 Umidade: ${umidade}%</p>
            <p>💨 Vento: ${vento} km/h</p>
            <p>🌤️ Condição: ${getCondicaoClimatica(codigoClima)}</p>
        `;
        // Criar a seção da previsão para os próximos dias
        const previsaoDiaria = document.createElement("section");
        previsaoDiaria.innerHTML = "<h2>Previsão para 7 dias</h2>";

        for (let i = 0; i < datas.length; i++) {
            // Criar um card para cada dia
            const card = document.createElement("div");

            // Converter a data para o formato brasileiro
            const dataFormatada = new Date(
                `${datas[i]}T12:00:00`
            ).toLocaleDateString("pt-BR");

            // Preencher o card com os dados do dia
            card.innerHTML = `
                <h3>${dataFormatada}</h3>
                <p>🌤️ ${getCondicaoClimatica(codigosClima[i])}</p>
                <p>🌡️ Máxima: ${maximas[i]} °C</p>
                <p>❄️ Mínima: ${minimas[i]} °C</p>
            `;

            // Adicionar o card à seção
            previsaoDiaria.appendChild(card);
        }

        // Adicionar a seção ao resultado da página
        resultado.appendChild(previsaoDiaria);
            } 

    // exibir mensagem de erro no HTML
    catch (erro) {
            resultado.innerHTML = "<p>Erro ao buscar a previsão do tempo.</p>";
            console.error(erro);
        }
}

// função para retornar a condição climática com base no código do clima
function getCondicaoClimatica(codigoClima) {
            switch (codigoClima) {
                case 0:
                    return "Céu limpo";
                case 1:
                case 2:
                    return "Parcialmente nublado";
                case 3:
                    return "Nublado";
                case 45:
                case 48:
                    return "Neblina";
                case 51:
                case 53:
                case 55:
                    return "Chuva leve";
                case 56:
                case 57:
                    return "Chuva gelada";
                case 61:
                case 63:
                case 65:
                    return "Chuva moderada";
                case 66:
                case 67:
                    return "Chuva gelada";
                case 71:
                case 73:
                case 75:
                    return "Neve";
                case 77:
                    return "Grânulos de neve";
                case 80:
                case 81:
                case 82:
                    return "Pancadas de chuva";
                case 85:
                case 86:
                    return "Tempestade de neve";
                default:
                    return "Condição climática desconhecida";
            }
}