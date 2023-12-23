import "dotenv/config";
import dotenv from "dotenv";
import {dirname, resolve} from "path";
import {askQuestion} from "./openAiClient.mjs";
import { fileURLToPath } from "url";
import {getTownsOf} from "./openStreetMapOverpass.mjs";
import {saveToDisk} from "./utils.mjs";

// local .env (ESModule syntax)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, ".env");
dotenv.config({ path: envPath });

/**
 * Land /Bundesland => Norwegen / Baden-Württemberg (etc.)
 * get Regionen
 * get PLZ von Regionen
 * get POI von PLZ
 */

(async function run() {
    // todo enable User-Input

    const towns = await getTownsOf("NO-46");

    const answerSyntax = JSON.stringify({
        name: typeof "",
        stadt: typeof "",
        adresse: typeof "",
        koordinaten: {latitude: typeof 0, longitude: typeof 0},
        besonderheiten: typeof ""
    });

    const pointOfInterestTypes = ["Wohnmobilstellplätze", "Campingplätze"];
    const pointOfInterestType = pointOfInterestTypes[0]; // todo
    const poiCount= towns.length;
    const errors = [];

    console.log(`searching "${pointOfInterestType}" points of interest for ${poiCount} towns...`);

    for (const [regionIndex, searchArea] of towns.entries()) {
        console.log(`gathering ${regionIndex +1}/${poiCount} "${searchArea}" ...`);

        const questionText = `Nenn mir alle ${pointOfInterestType} in ${searchArea} mit ihren Besonderheiten. Nutze hierzu folgende Syntax; ${answerSyntax}.`;
        const response = await askQuestion(questionText);
        // console.log("index.mjs:74 / run", {response});
        if (!response?.message?.content) {
            continue;
        }

        // save raw data
        const filename = searchArea.trim().replaceAll(" ", "-");
        await saveToDisk(response.message.content, filename, ".txt");

        // save JSON parsed data
        let answer = undefined;
        try {
            answer = JSON.parse(response.message.content);
        } catch (e) {
            console.error(e);
            errors.push({town: searchArea, error: e});
            continue;
        }
        await saveToDisk(answer, filename);
    }

    console.log(`finished with ${errors.length} error${errors.length === 1 ? "" : "s"}.`);
    errors.forEach((e) => console.log(`Town: ${e.town}, Error: ${e.error}`));
})();
