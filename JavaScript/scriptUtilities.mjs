import {join} from "path";
import {appendFile, existsSync, mkdirSync, writeFile} from "fs";

/**
 * Write data to disk. Data will be JSON stringified. If targeted file already exists, the data will be appended.
 * @param {Record<string,any>} data
 * @param {string} directory directory name relative to "./data"
 * @param {string} filename filename without extension
 * @param {string} fileExtension file extension, defaults to ".json"
 * @returns {Promise<void>}
 * @throws {Error} if an error occurs while writing to disk or JSON stringifying the data.
 */
export async function writeToDisk(
        data, directory, filename, fileExtension = ".json",
) {
    const targetDir = join("./data", directory);
    existsSync(targetDir) || mkdirSync(targetDir, {recursive: true});

    const filepath = join(targetDir, filename + fileExtension);
    const promise = new Promise((resolve, reject) => {
        if (existsSync(filepath)) {
            appendFile(filepath, "\n" + JSON.stringify(data), (error) => {
                if (error) reject(error);
                resolve();
            });
        } else {
            writeFile(filepath, JSON.stringify(data), (error) => {
                if (error) reject(error);
                resolve();
            });
        }

    });
    return await promise;
}

/**
 * Set a property of an object dynamically. The property key is a string containing the path to the property.
 * @param {string} propertyKey path to the property, e.g. "fields.licenceVariant.licenceVariantName"
 * @param {any} propertyValue value to set
 * @param {Record<string,any>} object object to set the property on
 * @returns {Record<string,any>} the object with the property set
 */
export function setDynamicProperty(propertyKey, propertyValue, object) {
    propertyKey.split(".").reduce((
            obj, key, index, array,
    ) => {
        if (index === array.length - 1) {
            obj[key] = propertyValue;
        }
        return obj[key];
    }, object);
    return object;
}

/**
 * Get a property of an object dynamically. The property key is a string containing the path to the property.
 * @param propertyKey path to the property, e.g. "fields.licenceVariant.licenceVariantName"
 * @param object object to get the property from
 * @returns {any | null} the property value or null if the property does not exist (or is undefined)
 */
export function getDynamicProperty(propertyKey, object) {
    return propertyKey.split(".").reduce((obj, key) => obj[key], object) || null;
}