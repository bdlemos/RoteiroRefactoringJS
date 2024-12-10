const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

class ServicoCalculoFatura {
  constructor(repo) {
    this.repo = repo;
  }
  calcularTotalApresentação(apre) {
    let total = 0;
    switch (this.repo.getPeca(apre).tipo) {
    case "tragedia":
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
         total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
        throw new Error(`Peça desconhecida: ${this.repo.getPeca(apre).tipo}`);
    }
    return total;
  }
  
  calcularCredito(apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (this.repo.getPeca(apre).tipo === "comedia") 
       creditos += Math.floor(apre.audiencia / 5);
    return creditos;
  }
  
  calcularTotalCreditos(apresentacoes) {
    let creditos = 0;
    for (let apre of apresentacoes) {
      creditos += this.calcularCredito(apre);
    }
    return creditos;
  }
  
  calcularTotalFatura(apresentacoes) {
    let totalFatura = 0;
    for (let apre of apresentacoes) {
      totalFatura += this.calcularTotalApresentação(apre);
    }
    return totalFatura;
  }
}

class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

function gerarFaturaStr (fatura,calc) {

    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
        faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentação(apre))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
    return faturaStr;
}

// function gerarFaturaHtml (fatura, pecas) {
//     let faturaHtml = `<html>\n<p> Fatura ${fatura.cliente} </p>\n<ul>\n`;
//     for (let apre of fatura.apresentacoes) {
//         faturaHtml += `<li>  ${getPeca(apre,pecas).nome}: ${formatarMoeda(calcularTotalApresentação(apre,pecas))} (${apre.audiencia} assentos) </li>\n`;
//     }
//     faturaHtml += `</ul>\n<p> Valor total: ${formatarMoeda(calcularTotalFatura(fatura.apresentacoes, pecas))} </p>\n`;
//     faturaHtml += `<p> Créditos acumulados: ${calcularTotalCreditos(fatura.apresentacoes, pecas)} </p>\n</html>`;
//     return faturaHtml;
// }

const faturas = JSON.parse(readFileSync('./faturas.json'));

const calc = new ServicoCalculoFatura(new Repositorio());
const faturaStr = gerarFaturaStr(faturas, calc);
// const faturaHtml = gerarFaturaHtml(faturas, pecas);
console.log(faturaStr);
// console.log(faturaHtml);
