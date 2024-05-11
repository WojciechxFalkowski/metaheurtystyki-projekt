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

const loadData = (): Data => {
	const rawData = fs.readFileSync('data.json', 'utf8');
	return JSON.parse(rawData) as Data;
};

const createIndividual = (items: Item[]): Individual => {
	const genes = items.map(() => Math.round(Math.random()));
	const { value, weight } = calculateFitness(genes, items);
	return { genes, value, weight };
};

const calculateFitness = (individual: number[], items: Item[]): { value: number; weight: number } => {
	let totalWeight = 0, totalValue = 0;
	individual.forEach((gene, index) => {
		if (gene === 1) {
			totalWeight += items[index].weight;
			totalValue += items[index].value;
		}
	});
	return { value: totalWeight <= loadData().capacity ? totalValue : 0, weight: totalWeight };
};

const generatePopulation = (size: number, items: Item[]): Individual[] => {
	return Array.from({ length: size }, () => createIndividual(items));
};

const select = (population: Individual[]): Individual[] => {
	return population
		.sort((a, b) => b.value - a.value)
		.slice(0, population.length / 2);
};

const crossover = (individual1: Individual, individual2: Individual): [Individual, Individual] => {
	const cutPoint = Math.floor(Math.random() * individual1.genes.length);
	const child1Genes = [
		...individual1.genes.slice(0, cutPoint),
		...individual2.genes.slice(cutPoint),
	];
	const child2Genes = [
		...individual2.genes.slice(0, cutPoint),
		...individual1.genes.slice(cutPoint),
	];
	return [createIndividualFromGenes(child1Genes), createIndividualFromGenes(child2Genes)];
};

const createIndividualFromGenes = (genes: number[]): Individual => {
	const { items } = loadData();
	const { value, weight } = calculateFitness(genes, items);
	return { genes, value, weight };
};

const mutate = (individual: Individual): Individual => {
	const mutationPoint = Math.floor(Math.random() * individual.genes.length);
	const newGenes = [...individual.genes];
	newGenes[mutationPoint] = individual.genes[mutationPoint] === 1 ? 0 : 1;
	return createIndividualFromGenes(newGenes);
};

const appendResultsToFile = (fileName: string, result: Individual): void => {
	let existingResults: { genes: string; value: number; weight: number }[] = [];
	try {
		// Próba odczytania i parsowania istniejących danych
		const data = fs.readFileSync(fileName, 'utf8');
		existingResults = JSON.parse(data);
	} catch (error) {
		console.log("Nie udało się odczytać istniejących danych, tworzenie nowego pliku.");
	}

	// Dodanie nowego wyniku do istniejących
	existingResults.push({ genes: result.genes.join(""), value: result.value, weight: result.weight });

	// Zapisanie aktualnej listy wyników do pliku
	fs.writeFileSync(fileName, JSON.stringify(existingResults, null, 2));
};

const runGeneticAlgorithm = (iterations: number, fileName: string): void => {
    const { items } = loadData();
    let population = generatePopulation(10, items);

    for (let generation = 0; generation < iterations; generation++) {
        const newPopulation: Individual[] = [];
        const selectedIndividuals = select(population);

        while (newPopulation.length < population.length) {
            const parent1 = selectedIndividuals[Math.floor(Math.random() * selectedIndividuals.length)];
            const parent2 = selectedIndividuals[Math.floor(Math.random() * selectedIndividuals.length)];
            const [child1, child2] = crossover(parent1, parent2);
            newPopulation.push(mutate(child1), mutate(child2));
        }

        population = newPopulation;

        // Wyznaczenie i zapisanie najlepszego rozwiązania w danej iteracji
        const bestSolution = population.sort((a, b) => b.value - a.value)[0];
        appendResultsToFile(fileName, bestSolution);
    }

    // Opcjonalnie, jeśli chcesz również wypisać najlepsze rozwiązanie po wszystkich iteracjach:
    const overallBestSolution = population.sort((a, b) => b.value - a.value)[0];
    console.log(`Ostateczne najlepsze rozwiązanie: ${overallBestSolution.genes.join("")}, Wartość: ${overallBestSolution.value}, Waga: ${overallBestSolution.weight}`);
};

// Przykładowe użycie
const ITERATIONS = 5
const OUTPUT_FILE = 'results.json';
runGeneticAlgorithm(ITERATIONS, OUTPUT_FILE);
