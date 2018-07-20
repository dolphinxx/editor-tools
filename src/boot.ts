import storage from "./storage";
function bootstrap() {
    if(storage.getRegexList().length === 0) {
        const builtInRegexList = [{"regex": "^\\|\\|(([^\\-\\s]+-)?[^\\s]+)$",replace: "$1"},{regex: "^(第[零一二三四五六七八九十百千万]+章)\\s*([^\\s]+)$",replace: "$1 $2"}];
        storage.setRegexList(builtInRegexList);
    }
}
export default bootstrap;
