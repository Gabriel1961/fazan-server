// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import http from "http";
import { Ollama } from "ollama-node";
import StoreService from "./StoreService";
import cors from "cors";

dotenv.config();

let isLlamaLoaded = false;
const ollama = new Ollama();
ollama.setModel("llama3.1").then(() => {
	isLlamaLoaded = true;
});

// Initialize StoreService
const storeService = new StoreService();
storeService.loadDataStore("dataStore.json"); // Load the data store from file

const app: Express = express();
const port = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

app.use(cors());

app.get("/combine", async (req: Request, res: Response) => {
	let { object1, object2, operation } = req.query;

	if (!isLlamaLoaded) {
		res.status(400).send("Model not available.");
		return;
	}

	if (typeof object1 === "string" && typeof object2 === "string" && typeof operation === "string") {
		object1 = object1.trim();
		object2 = object2.trim();
		operation = operation.trim();

		if (operation === "add") {
			operation = " combined with ";
		} else if (operation == "mul") {
			operation = " multiplied by ";
		} else if (operation == "div") {
			operation = " divided by ";
		} else if (operation == "sub") {
			operation = " without ";
		} else {
			console.log(operation)
			res.status(400).send("X");
			return;
		}

		let prompt =
			"Give the answer to: '" +
			object1 +
			" " +
			operation +
			" " +
			object2 +
			"' (respond in one word and one emoji)";

		if (storeService.getKey(prompt)) {
			res.send(storeService.getKey(prompt));
			return;
		}

		let maxTries = 3;
		let responseString = "";
		do {
			let llamaResponse = await ollama.generate(prompt);
			responseString = llamaResponse.output + "";

			if (
				responseString.length > 20 ||
				responseString.toLowerCase().includes("emoji") ||
				responseString.toLowerCase().includes("word")
			) {
				responseString = "Error ⚠️";
			}

			maxTries--;
		} while (responseString === "Error ⚠️" && maxTries > 0);

		storeService.setKey(prompt, responseString);

		res.send(responseString);
	} else {
		res
			.status(400)
			.send("All three parameters (object1, object2, operation) must be provided as strings.");
	}
});

// Start the server
server.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});

// Save data to disk on process exit
const saveAndExit = () => {
	console.log("Saving to file...");
	storeService.saveDataStoreToDisk();
	process.exit();
};

process.on("SIGINT", saveAndExit); // Handle Ctrl+C
process.on("SIGTERM", saveAndExit); // Handle termination
process.on("exit", saveAndExit); // Handle normal exit
