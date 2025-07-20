export default function AnimatedGradientText({ text }: { text: string }) {
    return (
      <span className="animate-text-gradient from-muted via-primary to-muted-foreground inline-flex bg-gradient-to-r bg-[200%_auto] bg-clip-text text-center text-sm font-medium text-transparent">
        {text}
      </span>
    );
  }
  