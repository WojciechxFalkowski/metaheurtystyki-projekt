//skrypt generuje 200 przedmiotów z losowymi wagami (od 1 do 10) i wartościami (od 1 do 100),
// a następnie zapisuje je w pliku data.json razem z przykładową pojemnością plecaka ustawioną na 500.

const fs = require("fs");

const generateItems = (numItems) => {
  let items = [];
  for (let i = 0; i < numItems; i++) {
    items.push({
      id: i + 1,
      weight: Math.floor(Math.random() * 10) + 1, // Wagi od 1 do 10
      value: Math.floor(Math.random() * 100) + 1, // Wartości od 1 do 100
    });
  }
  return items;
};

const data = {
  capacity: 500, // pojemność plecaka
  items: generateItems(200), // Generowanie przedmiotów
};

fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
