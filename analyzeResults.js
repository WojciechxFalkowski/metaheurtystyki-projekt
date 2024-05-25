const fs = require('fs');
const results = JSON.parse(fs.readFileSync('results.json', 'utf8'));

/**
 * Funkcja analizuje wyniki zapisane w pliku results.json.
 * Grupuje wyniki według konfiguracji, oblicza średnią wartość, wagę oraz odchylenie standardowe dla każdej konfiguracji.
 */
const summarizeResults = async () => {
    const chalk = await import('chalk');
    const summary = {};

    results.forEach(result => {
        const key = `${result.mutationRate}-${result.crossoverRate}-${result.populationSize}`;
        const resultName = `mutationRate: ${result.mutationRate}, crossoverRate: ${result.crossoverRate}, populationSize: ${result.populationSize}`;
        if (!summary[key]) {
            summary[key] = { values: [], weights: [], resultName: resultName };
        }
        summary[key].values.push(result.value);
        summary[key].weights.push(result.weight);
    });

    for (const [key, { values, weights, resultName }] of Object.entries(summary)) {
        const meanValue = values.reduce((a, b) => a + b, 0) / values.length;
        const meanWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
        const stdDevValue = Math.sqrt(values.map(x => Math.pow(x - meanValue, 2)).reduce((a, b) => a + b) / values.length);
        const stdDevWeight = Math.sqrt(weights.map(x => Math.pow(x - meanWeight, 2)).reduce((a, b) => a + b) / weights.length);

        console.log(chalk.default.blue(`Konfiguracja: ${resultName}`));
        console.log(`Średnia wartość: ${meanValue.toFixed(2)}, Odchylenie standardowe wartości: ${stdDevValue.toFixed(2)}`);
        console.log(`Średnia waga: ${meanWeight.toFixed(2)}, Odchylenie standardowe wagi: ${stdDevWeight.toFixed(2)}`);
        console.log('\n'); // Linia przerwy między wynikami różnych konfiguracji
    }
};

summarizeResults();