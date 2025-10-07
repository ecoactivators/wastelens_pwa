import {logMessage} from "./logUtils.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function populateTemplate(str: string, ...args: any[]): string {
    //return str.replace(/%s/g, () => args.shift());
    const newString:string = args.reduce((s, v) => s.replace('%s', v), str);
    logMessage("populated: " + newString);
    return newString;
}