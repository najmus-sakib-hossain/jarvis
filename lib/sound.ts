import React from "react";
import { HookOptions, PlayOptions, PlayFunction, ReturnedValue } from "@/types/sound";

function useOnMount(callback: React.EffectCallback) {
    React.useEffect(callback, []);
}

export default function useSound<T = any>(
    src: string | string[],
    {
        id,
        volume = 1,
        playbackRate = 1,
        soundEnabled = true,
        interrupt = false,
        onload,
        ...delegated
    }: HookOptions<T> = {} as HookOptions
) {
    const HowlConstructor = React.useRef<any | null>(null);
    const isMounted = React.useRef(false);

    const [duration, setDuration] = React.useState<number | null>(null);
    const [sound, setSound] = React.useState<any | null>(null);

    const handleLoad = function (this: ({ duration: any; src: string[]; volume: number; rate: number; onload: () => void; } & Omit<HookOptions<T>, "id" | "volume" | "playbackRate" | "soundEnabled" | "interrupt" | "onload">) | ({ src: string[]; volume: number; onload: () => void; } & Omit<HookOptions<T>, "id" | "volume" | "playbackRate" | "soundEnabled" | "interrupt" | "onload">)) {
        if (typeof onload === "function") {
            onload.call(this);
        }

        if (isMounted.current) {
            if ("duration" in this && typeof this.duration === "function") {
                setDuration(this.duration() * 1000);
            }
        }

        setSound(this);
    };

    useOnMount(() => {
        import("howler").then(mod => {
            if (!isMounted.current) {
                HowlConstructor.current = mod.Howl ?? mod.default.Howl;

                isMounted.current = true;

                new HowlConstructor.current({
                    src: Array.isArray(src) ? src : [src],
                    volume,
                    rate: playbackRate,
                    onload: handleLoad,
                    ...delegated,
                });
            }
        });

        return () => {
            isMounted.current = false;
        };
    });

    React.useEffect(() => {
        if (HowlConstructor.current && sound) {
            setSound(
                new HowlConstructor.current({
                    src: Array.isArray(src) ? src : [src],
                    volume,
                    onload: handleLoad,
                    ...delegated,
                })
            );
        }
    }, [JSON.stringify(src)]);

    React.useEffect(() => {
        if (sound) {
            sound.volume(volume);

            if (!delegated.sprite) {
                sound.rate(playbackRate);
            }
        }
    }, [sound, volume, playbackRate]);

    const play: PlayFunction = React.useCallback(
        (options?: PlayOptions) => {
            if (typeof options === "undefined") {
                options = {};
            }

            if (!sound || (!soundEnabled && !options.forceSoundEnabled)) {
                return;
            }

            if (interrupt) {
                sound.stop();
            }

            if (options.playbackRate) {
                sound.rate(options.playbackRate);
            }

            sound.play(options.id);
        },
        [sound, soundEnabled, interrupt]
    );



    const stop = React.useCallback((id: any) => {
        if (!sound) {
            return;
        }
        sound.stop(id);
    }, [sound]);

    const pause = React.useCallback((id: any) => {
        if (!sound) {
            return;
        }
        sound.pause(id);
    }, [sound]);

    const returnedValue: ReturnedValue = [
        play,
        {
            sound,
            stop,
            pause,
            duration,
        },
    ];

    return returnedValue;
}

export { useSound };