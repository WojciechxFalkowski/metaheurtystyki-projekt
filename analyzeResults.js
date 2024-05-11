const fs = require("fs");

// Funkcja do obliczania średniej wartości
function calculateAverage(values) {
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

// Funkcja do obliczania wariancji
function calculateVariance(values, average) {
  const sumOfSquares = values.reduce(
    (acc, value) => acc + Math.pow(value - average, 2),
    0
  );
  return sumOfSquares / values.length;
}

// Funkcja do obliczania wariancji
function calculateVariance(values, average) {
  const sumOfSquares = values.reduce(
    (acc, value) => acc + Math.pow(value - average, 2),
    0
  );
  return sumOfSquares / values.length;
}

// Funkcja do obliczania odchylenia standardowego
function calculateStandardDeviation(variance) {
    return Math.sqrt(variance);
}

// Funkcja do wczytywania danych z pliku JSON
function analyzeResults() {
  fs.readFile("results.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }
    try {
      const results = JSON.parse(data);
      const values = results.map((individual) => individual.value);

      // Obliczenia statystyczne
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const averageValue = calculateAverage(values);
      const variance = calculateVariance(values, averageValue);
      const standardDeviation = calculateStandardDeviation(variance);

      // Wyświetlanie wyników
      console.log(`Najlepszy wynik: ${maxValue}`);
      console.log(`Najgorszy wynik: ${minValue}`);
      console.log(`Średni wynik: ${averageValue.toFixed(2)}`);
      console.log(`Wariancja: ${variance.toFixed(2)}`);
      console.log(`Odchylenie standardowe: ${standardDeviation.toFixed(2)}`);
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
    }
  });
}

analyzeResults();
