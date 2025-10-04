  // Parse C++ files (generic parsing as a placeholder)
  import {ParsedFile, parseGeneric} from "@/components/github/Doxygen/utils/ParseMaster";

 export const parseCpp = (lines: string[], parsed: ParsedFile) => {
    parseGeneric(lines, parsed);
  };