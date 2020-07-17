// ToDo:
// import uuidv4 from "uuid/v4";

export interface ISyncMessage {
    key: string;
    message: any;
}

export async function notifyParent(messageKey: string, data?: any, timeout: number = 3000): Promise<any> {
    const expectedAnswer = messageKey + "done";
    return new Promise((resolve, reject) => {
        const callback = (event: any) => {
            const msg: ISyncMessage = JSON.parse(event.data);
            if (msg.key === expectedAnswer) {
                unsubscribeSelf(callback);
                clearTimeout(timeoutId);
                resolve(msg.message);
            }
        };
        const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            unsubscribeSelf(callback);
            reject("timeout");
        }, timeout);
        window.addEventListener("message", callback);
        const msg: ISyncMessage = {
            key: messageKey,
            message: data,
        };
        window.parent.postMessage(JSON.stringify(msg), "*");
    });
}

function unsubscribeSelf(callback: (event: any) => any): void {
    window.removeEventListener("message", callback);
}

export function unsubscribe(target: Window, callback: (event: any) => any): void {
    target.removeEventListener("message", callback);
}

export async function subscribe(
    target: Window,
    messageKey: string,
    callback: (args?: any) => Promise<any>): Promise<void> {

    target.addEventListener("message", async (event) => {
        return new Promise(async (resolve, reject) => {
            const syncMessage: ISyncMessage = JSON.parse(event.data);
            if (syncMessage.key !== messageKey) {
                return;
            }
            let result;
            try {
                result = await callback(syncMessage.message);
            } catch (error) {
                reject(error);
            }
            const msg: ISyncMessage = {
                key: syncMessage.key + "done",
                message: result,
            };
            const msgSender = event.source as Window;
            msgSender.postMessage(JSON.stringify(msg), "*");
            resolve();
        });
    });
}