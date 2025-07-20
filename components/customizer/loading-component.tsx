import { FrameHighlight } from "@/components/customizer/frame-highlight";

export function LoadingComponent() {
  return (
    <div className="inset-0 m-auto h-screen content-center text-center font-mono text-3xl font-semibold">
      <FrameHighlight>loading...</FrameHighlight>
    </div>
  );
}
