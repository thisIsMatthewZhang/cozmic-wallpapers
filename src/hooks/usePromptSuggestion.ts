import { useMemo, useState } from "react";

import { promptIdeas } from "../utils/mockData";

export function usePromptSuggestion() {
  const [index, setIndex] = useState(0);

  const suggestion = useMemo(() => {
    return promptIdeas[index % promptIdeas.length];
  }, [index]);

  const cycleSuggestion = () => {
    setIndex((current) => current + 1);
  };

  return {
    suggestion,
    cycleSuggestion,
  };
}
