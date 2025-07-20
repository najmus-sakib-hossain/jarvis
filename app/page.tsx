"use client"

import useSound from "@/lib/sound";

const BoopButton = () => {
    const [play] = useSound("/click.mp3");
    return <button className="rounded-md border text-center bg-rose-500 hover:bg-pink-500 text-sm p-2" onClick={() => play()}>Boop!</button>;
};

export default function HomePage() {
    return (
        <div className="h-full w-full flex items-center justify-center font-bold text-4xl flex-col gap-2">
            <span>DX SOUND</span>
            <BoopButton />
        </div>
    );
}
 