class RegexTuple {
    public regex:string;
    public replace:string;
    constructor(regex:string, replace:string) {
        this.regex = regex;
        this.replace = replace;
    }
}
const storage = {
    get(key:string):string|null {
        return window.localStorage.getItem(key);
    },
    set(key:string, value:any):void {
        if (value === null) {
            window.localStorage.removeItem(key);
            return;
        }
        window.localStorage.setItem(key, value);
    },
    getJSON(key:string):any|null {
        let data = window.localStorage.getItem(key);
        if (data === null) {
            return null;
        }
        return JSON.parse(data);
    },
    setJSON(key:string, value:any):void {
        if (value === null || value === undefined) {
            window.localStorage.removeItem(key);
            return;
        }
        if (typeof value === 'string') {
            window.localStorage.setItem(key, value);
            return;
        }
        window.localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key:string):void {
        window.localStorage.removeItem(key);
    },
    getRegexList():Array<RegexTuple> {
        return storage.getJSON("regex_list")||[];
    },
    setRegexList(value:Array<RegexTuple>) {
        storage.setJSON("regex_list", value);
    }
};
export default storage;