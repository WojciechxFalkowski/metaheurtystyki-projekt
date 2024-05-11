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

const loadData = (fileName: string): Data => {
	const rawData = fs.readFileSync(fileName, 'utf8');
	return JSON.parse(rawData);
};

const createIndividual = (items: Item[], capacity: number): Individual => {
	const genes = items.map(() => Math.round(Math.random()));
	return evaluateIndividual(genes, items, capacity);
};

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

const generatePopulation = (size: number, items: Item[], capacity: number): Individual[] => {
	return Array.from({ length: size }, () => createIndividual(items, capacity));
};

const select = (population: Individual[]): Individual[] => {
	return population.filter(individual => individual.value > 0).slice(0, population.length / 2);
};

const crossover = (parent1: Individual, parent2: Individual): [Individual, Individual] => {
	const cutPoint = Math.floor(Math.random() * parent1.genes.length);
	const child1Genes = [...parent1.genes.slice(0, cutPoint), ...parent2.genes.slice(cutPoint)];
	const child2Genes = [...parent2.genes.slice(0, cutPoint), ...parent1.genes.slice(cutPoint)];
	return [parent1, parent2]; // Powrót do rodziców, aby uprościć przykład
};

const mutate = (individual: Individual, items: Item[], capacity: number): Individual => {
	const mutationPoint = Math.floor(Math.random() * individual.genes.length);
	const newGenes = [...individual.genes];
	newGenes[mutationPoint] = individual.genes[mutationPoint] === 1 ? 0 : 1;
	return evaluateIndividual(newGenes, items, capacity);
};

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
