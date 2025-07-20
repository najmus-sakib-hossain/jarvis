export class TranslatorException extends Error {
    constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
    }
  }
  
  export class TranslationNotFoundException extends TranslatorException {
    constructor(text: string) {
      super(`Translation not found for the following text: "${text}"`);
    }
  }
  
  export class LanguageNotSupportedException extends TranslatorException {
    constructor(lang: string) {
      super(`Language "${lang}" is not supported by this translator.`);
    }
  }
  