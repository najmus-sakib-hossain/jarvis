import axios from "axios";
import { LanguageNotSupportedException, TranslationNotFoundException } from "@/constants/exceptions";
import { getLanguageCode, GOOGLE_LANGUAGES_TO_CODES } from "@/constants/languages";

export abstract class BaseTranslator {
  public source: string;
  public target: string;
  private supportedLanguages: Map<string, string>;

  constructor(source: string, target: string, supportedLanguages: Map<string, string>) {
    this.supportedLanguages = supportedLanguages;
    this.source = this.mapLanguageToCode(source);
    this.target = this.mapLanguageToCode(target);
  }

  private mapLanguageToCode(lang: string): string {
    const code = getLanguageCode(lang, this.supportedLanguages);
    if (!code) {
      throw new LanguageNotSupportedException(lang);
    }
    return code;
  }
  abstract translate(text: string, ...args: any[]): Promise<string>;
}

export class Translate extends BaseTranslator {
  constructor(source: string = "auto", target: string) {
    super(source, target, GOOGLE_LANGUAGES_TO_CODES);
  }

  public async translate(text: string): Promise<string> {
    if (this.source === this.target || !text.trim()) {
      return text;
    }

    const url = "https://translate.google.com/translate_a/single";

    try {
      const { data } = await axios.get(url, {
        params: {
          client: "gtx",
          sl: this.source,
          tl: this.target,
          dt: "t",
          q: text,
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (data && data[0]) {
        const translatedText = data[0]
          .map((segment: any[]) => segment[0])
          .join("");
        
        if (translatedText) {
          return translatedText;
        }
      }

      throw new TranslationNotFoundException(text);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        // console.error("An Axios error occurred during Google translation:", error.message);
      } else {
        console.error("An unexpected error occurred during Google translation:", error);
      }
      throw new TranslationNotFoundException(text);
    }
  }
}
