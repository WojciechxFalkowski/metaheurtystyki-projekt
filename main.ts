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

interface Config {
	mutationRate: number;
	crossoverRate: number;
	populationSize: number;
}

/**
 * Wczytuje dane z pliku JSON.
 * @param fileName - Nazwa pliku z danymi.
 * @returns Dane zawierające pojemność plecaka i przedmioty.
 */
const loadData = (fileName: string): Data => {
	const rawData = fs.readFileSync(fileName, 'utf8');
	return JSON.parse(rawData);
};

/**
 * Tworzy nowego osobnika z losowymi genami.
 * @param items - Lista przedmiotów.
 * @param capacity - Pojemność plecaka.
 * @returns Nowy osobnik.
 */
const createIndividual = (items: Item[], capacity: number): Individual => {
	const genes = items.map(() => Math.round(Math.random()));
	return evaluateIndividual(genes, items, capacity);
};

/**
 * Ocena osobnika, oblicza jego wartość i wagę.
 * @param genes - Geny osobnika.
 * @param items - Lista przedmiotów.
 * @param capacity - Pojemność plecaka.
 * @returns Osobnik z obliczoną wartością i wagą.
 */
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

/**
 * Generuje populację osobników.
 * @param size - Rozmiar populacji.
 * @param items - Lista przedmiotów.
 * @param capacity - Pojemność plecaka.
 * @returns Populacja osobników.
 */
const generatePopulation = (size: number, items: Item[], capacity: number): Individual[] => {
	return Array.from({ length: size }, () => createIndividual(items, capacity));
};

/**
 * Wybiera najlepsze osobniki z populacji.
 * @param population - Populacja osobników.
 * @returns Wybrana populacja.
 */
const select = (population: Individual[]): Individual[] => {
	return population.filter(individual => individual.value > 0).slice(0, population.length / 2);
};

/**
 * Krzyżuje dwa osobniki, tworząc nowe osobniki.
 * @param parent1 - Pierwszy rodzic.
 * @param parent2 - Drugi rodzic.
 * @returns Dwa nowe osobniki.
 */
const crossover = (parent1: Individual, parent2: Individual): [Individual, Individual] => {
	const cutPoint = Math.floor(Math.random() * parent1.genes.length);
	const child1Genes = [...parent1.genes.slice(0, cutPoint), ...parent2.genes.slice(cutPoint)];
	const child2Genes = [...parent2.genes.slice(0, cutPoint), ...parent1.genes.slice(cutPoint)];
	return [
		evaluateIndividual(child1Genes, loadData('data.json').items, loadData('data.json').capacity),
		evaluateIndividual(child2Genes, loadData('data.json').items, loadData('data.json').capacity)
	];
};

/**
 * Mutuje geny osobnika z określonym prawdopodobieństwem.
 * @param individual - Osobnik do zmutowania.
 * @param mutationRate - Prawdopodobieństwo mutacji.
 * @returns Zmutowany osobnik.
 */
const mutate = (individual: Individual, mutationRate: number): Individual => {
	const newGenes = individual.genes.map(gene => (Math.random() < mutationRate ? 1 - gene : gene));
	return evaluateIndividual(newGenes, loadData('data.json').items, loadData('data.json').capacity);
};

/**
 * Zapisuje wynik eksperymentu do pliku.
 * @param fileName - Nazwa pliku do zapisu.
 * @param result - Najlepszy znaleziony osobnik.
 * @param config - Konfiguracja eksperymentu.
 */
const appendResultsToFile = (fileName: string, result: Individual, config: Config): void => {
	let existingResults: any[] = [];
	if (fs.existsSync(fileName)) {
		existingResults = JSON.parse(fs.readFileSync(fileName, 'utf8'));
	}
	existingResults.push({
		genes: result.genes.join(""),
		value: result.value,
		weight: result.weight,
		mutationRate: config.mutationRate,
		crossoverRate: config.crossoverRate,
		populationSize: config.populationSize
	});

	fs.writeFileSync(fileName, JSON.stringify(existingResults, null, 2));
};

/**
 * Przeprowadza eksperyment algorytmu genetycznego z daną konfiguracją.
 * @param config - Konfiguracja eksperymentu.
 */
const runExperiment = (config: Config) => {
	const data = loadData("data.json");
	let population = generatePopulation(config.populationSize, data.items, data.capacity);

	for (let generation = 0; generation < 100; generation++) {
		let newPopulation: Individual[] = select(population);
		while (newPopulation.length < population.length) {
			const parent1 = newPopulation[Math.floor(Math.random() * newPopulation.length)];
			const parent2 = newPopulation[Math.floor(Math.random() * newPopulation.length)];
			if (Math.random() < config.crossoverRate) {
				const [child1, child2] = crossover(parent1, parent2);
				newPopulation.push(mutate(child1, config.mutationRate), mutate(child2, config.mutationRate));
			}
		}
		population = newPopulation;
	}

	const bestSolution = population.sort((a, b) => b.value - a.value)[0];
	appendResultsToFile("results.json", bestSolution, config);
};

const configs: Config[] = [
	{ mutationRate: 0.01, crossoverRate: 0.7, populationSize: 50 },
	{ mutationRate: 0.05, crossoverRate: 0.7, populationSize: 50 },
	{ mutationRate: 0.01, crossoverRate: 0.9, populationSize: 50 },
	{ mutationRate: 0.01, crossoverRate: 0.7, populationSize: 100 },
];

/**
 * Uruchamia wiele symulacji dla każdej konfiguracji.
 * @param configs - Lista konfiguracji.
 * @param numRuns - Liczba uruchomień dla każdej konfiguracji.
 */
const runMultipleExperiments = (configs: Config[], numRuns: number) => {
	for (let i = 0; i < numRuns; i++) {
		configs.forEach(config => runExperiment(config));
	}
};

runMultipleExperiments(configs, 10)