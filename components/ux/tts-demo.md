import { intro, outro, text, spinner, isCancel } from '@/prompts';
import { GoogleTranslator } from '@/tts/google';
import { GOOGLE_LANGUAGES_TO_CODES } from "@/utils/languages";
import cfonts from "cfonts";
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

async function runTTSMode(): Promise<boolean> {
  const textToSpeak = await text({
    message: 'Enter the text to convert to speech (or press ESC to cancel):',
    initialValue: `আমরা এখনও বিটাতে রয়েছি`,
    validate: (input) => {
      if (!input) return 'Please enter some text.';
    },
  });

  if (isCancel(textToSpeak)) {
    return false;
  }

  const s = spinner();
  s.start('Detecting language and generating audio...');

  try {
    const detectUrl = "https://translate.google.com/translate_a/single";
    const { data: detectData } = await axios.get(detectUrl, {
      params: {
        client: "gtx",
        sl: "auto",
        tl: "en",
        dt: "t",
        q: textToSpeak,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const detectedLangCode = detectData?.[2];

    if (!detectedLangCode || typeof detectedLangCode !== 'string') {
      s.stop('Language Detection Failed.', 1);
      console.error('\nCould not automatically detect the language. Please try again.');
      return true;
    }

    const googleTranslator = new GoogleTranslator("auto", detectedLangCode);
    const audioBuffer = await googleTranslator.getTTS(textToSpeak as string, detectedLangCode);

    const outputPath = path.resolve(process.cwd(), 'output.mp3');
    await fs.writeFile(outputPath, audioBuffer);

    s.stop('Audio generation complete!');
    outro(`Audio saved to ${outputPath}`);

  } catch (error) {
    s.stop('An error occurred.');
    console.error((error as Error).message);
  }
  return true;
}

async function main() {
  console.clear();

  cfonts.say('Dx TTS', {
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

  intro('Welcome to the TTS CLI');

  while (true) {
    const shouldContinue = await runTTSMode();
    if (!shouldContinue) {
      break;
    }
  }

  outro('Goodbye!');
}

main().catch(console.error);
