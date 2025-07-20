import { intro, outro, select, text, spinner, isCancel } from '@/prompts';
// import { MyMemoryTranslator } from '@/translators/mymemory'; // MyMemory translator is commented out
import { GoogleTranslator } from '@/translators/google';
import { GOOGLE_LANGUAGES_TO_CODES, MYMEMORY_LANGUAGES_TO_CODES } from "@/utils/languages";
import cfonts from "cfonts";
import fs from 'fs/promises';
import path from 'path';

async function runTryMode(provider: 'Google' /*| 'MyMemory'*/) {
  const textToTranslate = await text({
    message: 'Enter the text to translate (or press ESC to cancel):',
    initialValue: `Hello World!`,
    validate: (input) => {
      if (!input) return 'Please enter some text.';
    },
  });

  if (isCancel(textToTranslate)) {
    outro('Operation cancelled.');
    return;
  }

  const sourceLang = 'english';
  const defaultTargetLang = 'french';

  const targetLang = await text({
    message: 'Enter the target language (e.g., "spanish", "german"):',
    initialValue: defaultTargetLang,
  });


  if (isCancel(targetLang)) {
    outro('Operation cancelled.');
    return;
  }

  const s = spinner();
  s.start('Translating...');

  try {
    let translatedText: string;

    if (provider === 'Google') {
      const sourceCode = GOOGLE_LANGUAGES_TO_CODES.get(sourceLang as string);
      const targetCode = GOOGLE_LANGUAGES_TO_CODES.get(targetLang as string);

      if (!sourceCode || !targetCode) {
        s.stop('Translation Failed.', 1);
        console.error(`\nInvalid language name for Google Translate. Supported languages: ${Array.from(GOOGLE_LANGUAGES_TO_CODES.keys()).join(', ')}`);
        return; // Return to the main menu if the language is invalid.
      }

      const googleTranslator = new GoogleTranslator(sourceCode, targetCode);
      translatedText = await googleTranslator.translate(textToTranslate as string);

      s.stop('Translation complete!');
      outro(`${translatedText}`);
    }
    /*
    // MyMemory provider logic is commented out
    else {
      const myMemoryTranslator = new MyMemoryTranslator({
        source: sourceLang as string,
        target: targetLang as string,
        email: "manfromexistence2@gmail.com",
      });
      translatedText = await myMemoryTranslator.translate(textToTranslate as string);
    }
    */

  } catch (error) {
    s.stop('An error occurred.');
    console.error((error as Error).message);
  }
}

async function runGenerateMode(provider: 'Google' /*| 'MyMemory'*/) {
  const filePathInput = await text({
    message: 'Enter the path to the source JSON file:',
    initialValue: './locales/en.json',
  });

  if (isCancel(filePathInput)) {
    outro('Operation cancelled.');
    return;
  }

  const s = spinner();

  try {
    s.start(`Reading source file: ${filePathInput}`);
    const absolutePath = path.resolve(process.cwd(), filePathInput as string);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const jsonContent = JSON.parse(fileContent);

    s.stop('File read successfully.');

    const languageMap = GOOGLE_LANGUAGES_TO_CODES;
    const targetLanguages: string[] = Array.from(languageMap.keys());

    const originalKeys = Object.keys(jsonContent);
    const originalValues = Object.values(jsonContent);
    const totalLanguages = targetLanguages.length;

    s.start(`Preparing to translate into ${totalLanguages} languages using ${provider}.`);

    for (let i = 0; i < totalLanguages; i++) {
      const langName = targetLanguages[i];
      if (langName === 'english') continue;

      s.message(`Translating to ${langName} (${i + 1} of ${totalLanguages})...`);

      try {
        let translator: any;

        if (provider === 'Google') {
          const sourceCode = GOOGLE_LANGUAGES_TO_CODES.get('english')!;
          const targetCode = GOOGLE_LANGUAGES_TO_CODES.get(langName)!;
          translator = new GoogleTranslator(sourceCode, targetCode);
        }
        /* // MyMemory provider logic is commented out
        else { // MyMemory
          translator = new MyMemoryTranslator({
            source: 'english',
            target: langName,
            email: 'manfromexistence1@gmail.com',
          });
        }
        */

        const translationPromises = originalValues.map(value =>
          translator.translate(String(value))
        );

        const translatedValues = await Promise.all(translationPromises);

        const newJsonContent = Object.fromEntries(
          originalKeys.map((key, index) => [key, translatedValues[index]])
        );

        const langCode = languageMap.get(langName)!;
        const localesDir = path.resolve(process.cwd(), 'locales');
        const targetFilePath = path.join(localesDir, `${langCode}.json`);

        await fs.mkdir(localesDir, { recursive: true });

        let finalJsonToWrite = newJsonContent;

        try {
          const existingContent = await fs.readFile(targetFilePath, 'utf-8');
          const existingJson = JSON.parse(existingContent);
          finalJsonToWrite = { ...existingJson, ...newJsonContent };
        } catch (err) {
          // If the file doesn't exist, a new one will be created.
        }

        await fs.writeFile(targetFilePath, JSON.stringify(finalJsonToWrite, null, 2), 'utf-8');

      } catch (langError) {
        // console.error(`\n[Error] Failed to process language "${langName}": ${(langError as Error).message}`);
      }
    }

    s.stop(`Translation process completed. Processed ${totalLanguages} languages.`);
    outro('All files have been generated/updated in the /locales directory.');

  } catch (error) {
    s.stop('An error occurred.');
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error('Error: File not found at the specified path.');
    } else if (error instanceof SyntaxError) {
      console.error('Error: Failed to parse JSON. Please check the file format.');
    } else {
      console.error((error as Error).message);
    }
  }
}

async function main() {
  console.clear();

  cfonts.say('Dx Translate', {
    font: 'block',
    align: 'left',
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
    gradient: ['cyan', 'blue'],
    independentGradient: true,
    transitionGradient: false,
    env: 'node'
  });

  intro('Welcome to the Translation CLI');

  while (true) {
    const provider = 'Google';
    /*
    const provider = await select({
      message: 'Select a translation provider:',
      options: [
        { value: 'Google', label: 'Google Translate' },
        { value: 'MyMemory', label: 'MyMemory' },
      ],
    });

    if (isCancel(provider)) {
      outro('Operation cancelled.');
      return;
    }
    */

    const mode = await select({
      message: 'What would you like to do? (Press ESC to exit)',
      options: [
        { value: 'Generate', label: 'Generate from a file' },
        { value: 'Try', label: 'Try a single translation' },
      ],
    });

    if (isCancel(mode)) {
      outro('Goodbye!');
      break;
    }

    if (mode === 'Generate') {
      await runGenerateMode(provider as 'Google' /*| 'MyMemory'*/);
    } else if (mode === 'Try') {
      await runTryMode(provider as 'Google' /*| 'MyMemory'*/);
    }
  }
}

main().catch(console.error);
