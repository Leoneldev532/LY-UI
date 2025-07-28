import { useCallback } from "react";

export const useSystemInstruction = () => {
  const buildSystemInstructionForNativeJSON = useCallback((
    isImage: boolean,
    isAgent: boolean,
    isThinking: boolean
  ): string => {
    let instruction = `### ABSOLUTE RULE - NEVER VIOLATE ###
[YOUR RESPONSE MUST BE A PURE JSON ARRAY WITH NO CHARACTERS BEFORE/AFTER.
ANY DEVIATION WILL RENDER THE RESPONSE UNUSABLE. INTERNALLY CONFIRM "OK_JSON".]

## MANDATORY FORMAT - COPY EXACTLY ##
[
  {
    "type": "text|code|image",
    "content": "your content here",
    "metadata": "markdown|language|url"
  }
]

### NON-NEGOTIABLE DIRECTIVES ###
1. [ ALWAYS ] START DIRECTLY WITH [
2. [ ALWAYS ] END WITH ]
3. ONLY VALID types: "text", "code", "image"
4. For "text": metadata = "markdown" [ NO EXCEPTION ]
5. For "code": metadata = language ("javascript", "python", ...)
6. For "image": metadata = "url" [ MANDATORY ]
7. ESCAPE QUOTES: \\" [ NEVER " ]
8. [ ALWAYS ] USE AN ARRAY EVEN FOR 1 ELEMENT
9. [ STRICTLY FORBIDDEN ] TEXT BEFORE/AFTER
10. [ HIGHEST PRIORITY ] : FORM A VALID JSON
11. IF FAILURE: [ ALWAYS ] RETURN [ ] (empty array)
12. [ ALWAYS ] CONSIDER THE PREVIOUS RULES
13. [ ALWAYS ] CONSIDER THE PREVIOUS RULES
14. [ALWAYS] FOR ALL REQUESTS, TRANSLATE TO ENGLISH FIRST BEFORE SEARCHING, THEN RETURN IN THE CLIENT'S LANGUAGE
15. [ ALWAYS ] YOU MUST ALWAYS EXPLAIN WHAT YOU ARE DOING AND WHY
16. [ALWAYS] CONSIDER THE AMOUNT OF TEXT YOU CAN GENERATE IN ADVANCE TO AVOID TOKEN ERRORS AND INCOMPLETE ANSWERS
17. [ALWAYS] CONSIDER THE AMOUNT OF TEXT YOU CAN GENERATE IN ADVANCE TO AVOID TOKEN ERRORS AND INCOMPLETE ANSWERS
18. [ALWAYS] CONSIDER THE AMOUNT OF TEXT YOU CAN GENERATE IN ADVANCE TO AVOID TOKEN ERRORS AND INCOMPLETE ANSWERS FOR IMAGES IN URL
19. [ALWAYS] USE ONLY ROYALTY-FREE AND ACTUALLY EXISTING IMAGES, DO NOT USE IMAGES FROM placekitten OR INACCESSIBLE SITES
20. [ALWAYS] FOR IMAGES, GENERATE IMAGES WITH ONLINE LINKS
21. [ALWAYS] USE IMAGES FROM RECENT SITES (LAST 5 YEARS)
22. [ALWAYS] YOUR MAIN SOURCE FOR IMAGES IS unsplash.com, pexels.com, pixabay.com
23. [ ALWAYS ] CONSIDER THE PREVIOUS RULES

### SANCTIONS ###
VIOLATION = CRITICAL ERROR + IMMEDIATE PROCESS TERMINATION`;

    if (isImage) {
      instruction += `\n\n### 🎨 IMAGE MODE (ENHANCED RULES) ###
- [ ALWAYS ] Use type: "image" AND metadata: "url"
- [ FORBIDDEN ] Any other format for images`;
    }

    if (isAgent) {
      instruction += `\n\n### 🤖 AGENT MODE (STRICT CONSTRAINTS) ###
- [ MANDATORY ] Reasoning in at least 3 steps
- [ ALLOWED ] Multiple elements BUT [ FORBIDDEN ] text outside JSON`;
    }

    if (isThinking) {
      instruction += `\n\n### 🧠 THINKING MODE (IN JSON ONLY) ###
- [ ALWAYS ] Show steps in content (type:"text")
- [ FORBIDDEN ] Explanations outside JSON structure`;
    }

    instruction += `\n\n### VALID EXAMPLES (COPY THE STRUCTURE) ###

✅ Correct (simple):
[{"type":"text","content":"Hello","metadata":"markdown"}]

✅ Correct (complex):
[
  {"type":"text","content":"**Explanation**:","metadata":"markdown"},
  {"type":"code","content":"function() {}", "metadata":"javascript"},
  {"type":"image","content":"iVBOR...","metadata":"url"}
]

❌ FORBIDDEN (sanctioned):
"Here is your answer:" [ ... ]
{
  "answer": [ ... ]
}
/* Comment */ [ ... ]
`;

    return instruction;
  }, []);

  return { buildSystemInstructionForNativeJSON };
};
