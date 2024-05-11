const fs = require('fs');

// Funkcja do obliczania średniej wartości
function calculateAverage(values) {
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
}

// Funkcja do wczytywania danych z pliku JSON
function analyzeResults() {
    fs.readFile('results.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        try {
            const results = JSON.parse(data);
            const values = results.map(individual => individual.value);

            // Obliczenia statystyczne
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            const averageValue = calculateAverage(values);

            // Wyświetlanie wyników
            console.log(`Najlepszy wynik: ${maxValue}`);
            console.log(`Najgorszy wynik: ${minValue}`);
            console.log(`Średni wynik: ${averageValue.toFixed(2)}`);
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
        }
    });
}

analyzeResults();
