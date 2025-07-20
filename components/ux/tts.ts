import axios from "axios";
import { LanguageNotSupportedException, TranslationNotFoundException } from "@/constants/exceptions";
import { getLanguageCode, GOOGLE_LANGUAGES_TO_CODES } from "@/constants/languages";

export abstract class BaseTTS {
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

export class TTS extends BaseTTS {
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

      throw new Error(`Translation not found for: ${text}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // console.error("An Axios error occurred during Google translation:", error.message);
      } else {
        console.error(
          "An unexpected error occurred during Google translation:",
          error
        );
      }
      throw new Error(`Translation failed for: ${text}`);
    }
  }

  private tokenize(text: string): string[] {
    const GOOGLE_TTS_MAX_CHARS = 100;
    const text_parts: string[] = [];
    if (text.length <= GOOGLE_TTS_MAX_CHARS) {
        text_parts.push(text);
        return text_parts;
    }

    const punc = "¡!()[]¿?.,;:—«»\n";
    let text_part = "";
    for (const char of text) {
        if (punc.includes(char)) {
            text_part += char;
            text_parts.push(text_part);
            text_part = "";
        } else {
            text_part += char;
        }
    }
    if(text_part.length > 0){
        text_parts.push(text_part);
    }
    return text_parts;
}


  public async getTTS(text: string, lang: string, slow: boolean = false): Promise<Buffer> {
    const GOOGLE_TTS_RPC = "jQ1olc";
    const GOOGLE_TTS_URL = 'https://translate.google.com/_/TranslateWebserverUi/data/batchexecute';

    const text_parts = this.tokenize(text);
    const audioBuffers: Buffer[] = [];

    for (const part of text_parts) {
        const parameter = [part, lang, slow ? true : null, "null"];
        const escaped_parameter = JSON.stringify(parameter);

        const rpc = [[[GOOGLE_TTS_RPC, escaped_parameter, null, "generic"]]];
        const espaced_rpc = JSON.stringify(rpc);
        const data = "f.req=" + encodeURIComponent(espaced_rpc);

        try {
            const response = await axios.post(GOOGLE_TTS_URL, data, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                },
                responseType: 'text'
            });

            const responseLine = response.data.split('\n')[2];
            const audioDataMatch = /"jQ1olc","\[\\"(.*)\\"\]"/.exec(responseLine);

            if (audioDataMatch && audioDataMatch[1]) {
                const audioBase64 = audioDataMatch[1];
                const audioBuffer = Buffer.from(audioBase64, 'base64');
                audioBuffers.push(audioBuffer);
            } else {
                 throw new Error('TTS generation failed: Could not extract audio data from response.');
            }
        } catch (error) {
             throw new Error(`TTS generation failed for part: "${part.substring(0, 20)}...".`);
        }
    }

    if (audioBuffers.length > 0) {
      return Buffer.concat(audioBuffers);
    }
    
    throw new Error('TTS generation failed: No audio data was produced.');
  }
}
