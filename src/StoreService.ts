import * as fs from 'fs';

export default class StoreService {
  storeName: string = "";
  private dataStore: Map<string, string> = new Map<string, string>();

  // Load data store from a file
  loadDataStore = (storeName: string) => {
    this.storeName = storeName;

    // Check if the file exists
    if (fs.existsSync(this.storeName)) {
      const fileContent = fs.readFileSync(this.storeName, 'utf-8');
      const data = JSON.parse(fileContent) as { [key: string]: string };

      // Populate the map with the data from the file
      for (const key in data) {
        this.dataStore.set(key, data[key]);
      }

      console.log(`Data loaded from ${this.storeName}`);
    } else {
      console.log(`No existing data store found. A new one will be created.`);
    }
  };

  // Store a key-value pair
  setKey = (key: string, value: string) => {
    this.dataStore.set(key, value);
  };

  getKey = (key: string) => {
    return this.dataStore.get(key);
  };


  // Save the data store to a file
  saveDataStoreToDisk = () => {
    const dataObject: { [key: string]: string } = {};

    // Convert the map to a plain object
    this.dataStore.forEach((value, key) => {
      dataObject[key] = value;
    });

    // Write the data to the file
    fs.writeFileSync(this.storeName, JSON.stringify(dataObject, null, 2), 'utf-8');
    console.log(`Data store saved to ${this.storeName}`);
  };
}