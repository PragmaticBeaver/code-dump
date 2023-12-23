import {existsSync, mkdirSync, writeFile} from "fs";
import {join} from "path";

export async function saveToDisk(data, filename, fileExtension = ".json") {
    const targetDir = "./data";
    existsSync(targetDir) || mkdirSync(targetDir);

    const promise = new Promise((resolve, reject) => {
        writeFile(join(targetDir, filename + fileExtension), JSON.stringify(data), (error) => {
            if (error) reject(error);
            resolve();
        });
    });
    return await promise;
}