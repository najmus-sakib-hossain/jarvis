interface SearchSuggestion {
  id: string;
  query: string;
}

interface SuggestionsResponse {
  suggestions: SearchSuggestion[];
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.trim().length === 0) return [];
  
  try {
    const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query.trim())}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch suggestions: ${response.status}`);
    }
    
    const data: SuggestionsResponse = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}

// Debounce function to limit API calls
export function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<F>) => {
    // const context = this;
    
    // if (timeout) clearTimeout(timeout);
    
    // timeout = setTimeout(() => {
    //   func.apply(context, args);
    //   timeout = null;
    // }, wait);
    null
  };
}
