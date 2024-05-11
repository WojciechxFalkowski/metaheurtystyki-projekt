import * as fs from 'fs';

interface Item {
	id: number;
	weight: number;
	value: number;
}

interface Data {
	capacity: number;
	items: Item[];
}

interface Individual {
	genes: number[];
	value: number;
	weight: number;
}

// loadData: Funkcja do wczytywania danych z pliku JSON.
// Przyjmuje nazwę pliku, odczytuje dane jako tekst, a następnie przekształca je w obiekt JSON.
const loadData = (fileName: string): Data => {
	const rawData = fs.readFileSync(fileName, 'utf8');
	return JSON.parse(rawData);
};

// createIndividual: Tworzy nowego osobnika na podstawie dostępnych przedmiotów i pojemności plecaka.
// Generuje losowo geny dla każdego przedmiotu (1 - przedmiot jest w plecaku, 0 - przedmiotu nie ma w plecaku),
// a następnie ocenia stworzonego osobnika, obliczając jego całkowitą wartość i wagę.
const createIndividual = (items: Item[], capacity: number): Individual => {
	const genes = items.map(() => Math.round(Math.random()));
	return evaluateIndividual(genes, items, capacity);
};

// createIndividual: Tworzy nowego osobnika na podstawie dostępnych przedmiotów i pojemności plecaka.
// Generuje losowo geny dla każdego przedmiotu (1 - przedmiot jest w plecaku, 0 - przedmiotu nie ma w plecaku),
// a następnie ocenia stworzonego osobnika, obliczając jego całkowitą wartość i wagę.
const evaluateIndividual = (genes: number[], items: Item[], capacity: number): Individual => {
	let totalWeight = 0, totalValue = 0;
	genes.forEach((gene, index) => {
		if (gene === 1) {
			totalWeight += items[index].weight;
			totalValue += items[index].value;
		}
	});
	return { genes, value: totalWeight <= capacity ? totalValue : 0, weight: totalWeight };
};

// generatePopulation: eneruje początkową populację osobników o określonej wielkości.
// Każdy osobnik jest tworzony na podstawie listy przedmiotów i pojemności plecaka.
const generatePopulation = (size: number, items: Item[], capacity: number): Individual[] => {
	return Array.from({ length: size }, () => createIndividual(items, capacity));
};

// select: Wybiera z populacji osobniki, których wartość przekracza 0.
// Zwraca połowę tej populacji, aby utrzymać presję selekcyjną w algorytmie.
const select = (population: Individual[]): Individual[] => {
	return population.filter(individual => individual.value > 0).slice(0, population.length / 2);
};

// crossover: Tworzy nowe geny dla dwóch potomków poprzez krzyżowanie genów dwóch rodziców w punkcie cięcia.
// Zwraca oryginalnych rodziców dla uproszczenia, zamiast prawdziwych dzieci.
const crossover = (parent1: Individual, parent2: Individual): [Individual, Individual] => {
	const cutPoint = Math.floor(Math.random() * parent1.genes.length);
	const child1Genes = [...parent1.genes.slice(0, cutPoint), ...parent2.genes.slice(cutPoint)];
	const child2Genes = [...parent2.genes.slice(0, cutPoint), ...parent1.genes.slice(cutPoint)];
	return [parent1, parent2];
};

// mutate: Modyfikuje geny osobnika poprzez mutację w losowym miejscu genotypu.
// Zmienia jeden gen z 0 na 1 lub z 1 na 0 i ocenia nowego osobnika na podstawie zmodyfikowanych genów.
const mutate = (individual: Individual, items: Item[], capacity: number): Individual => {
	const mutationPoint = Math.floor(Math.random() * individual.genes.length);
	const newGenes = [...individual.genes];
	newGenes[mutationPoint] = individual.genes[mutationPoint] === 1 ? 0 : 1;
	return evaluateIndividual(newGenes, items, capacity);
};

// runGeneticAlgorithm: Uruchamia algorytm genetyczny dla zadanej liczby iteracji.
// Wczytuje dane, generuje populację, przeprowadza selekcję, krzyżowanie, mutację i zapisuje najlepsze rozwiązanie.
const runGeneticAlgorithm = (iterations: number, fileName: string, outputFile: string): void => {
	const data = loadData(fileName);
	let population = generatePopulation(10, data.items, data.capacity);

	for (let generation = 0; generation < iterations; generation++) {
		let newPopulation: Individual[] = select(population);
		while (newPopulation.length < population.length) {
			const parent1 = newPopulation[Math.floor(Math.random() * newPopulation.length)];
			const parent2 = newPopulation[Math.floor(Math.random() * newPopulation.length)];
			const [child1, child2] = crossover(parent1, parent2);
			newPopulation.push(mutate(child1, data.items, data.capacity), mutate(child2, data.items, data.capacity));
		}
		population = newPopulation;

		const bestSolution = population.sort((a, b) => b.value - a.value)[0];
		appendResultsToFile(outputFile, bestSolution);
	}
};

// appendResultsToFile: Dodaje wynik działania algorytmu genetycznego do pliku JSON.
// W przypadku braku pliku lub błędów odczytu, tworzy nowy plik i zapisuje wyniki.
// Wyniki są zapisywane jako lista obiektów, każdy zawierający geny, wartość i wagę osobnika.
const appendResultsToFile = (fileName: string, result: Individual): void => {
	let existingResults: { genes: string; value: number; weight: number }[] = [];
	try {
		const data = fs.readFileSync(fileName, 'utf8');
		existingResults = JSON.parse(data);
	}
	catch (error) {
		console.log("Nie udało się odczytać istniejących danych, tworzenie nowego pliku.");
	}

	// Dodanie nowego wyniku do istniejących
	existingResults.push({ genes: result.genes.join(""), value: result.value, weight: result.weight });

	// Zapisanie aktualnej listy wyników do pliku
	fs.writeFileSync(fileName, JSON.stringify(existingResults, null, 2));
};

// Uruchomienie algorytmu genetycznego
const ITERATIONS = 5; // Liczba iteracji algorytmu
const INPUT_FILE = 'data.json'; // Plik wejściowy z danymi
const OUTPUT_FILE = 'results.json'; // Plik wyjściowy z wynikami
runGeneticAlgorithm(ITERATIONS, INPUT_FILE, OUTPUT_FILE);
