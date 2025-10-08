// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function populateTemplate(str: string, ...args: any[]): string {
    return str.replace(/%s/g, () => args.shift());
}