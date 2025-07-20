"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import type { Message } from "@/types/chat";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Fallback image (replace with a local placeholder image or a default URL)
const FALLBACK_IMAGE = "/placeholder-image.png"; // Add a placeholder image in your public folder

interface ImageGenProps {
  message: Message & { id?: string };
}

export default function ImageGen({ message }: ImageGenProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadImagesAndChapters = async () => {
      if (!message) {
        setError("No message data provided");
        setChapters([]);
        setImageUrls([]);
        return;
      }

      const textResponse =
        typeof message.content === "string" && message.content.trim()
          ? message.content
          : "No meaningful response provided.";

      // Split by four consecutive newlines instead of scene markers
      const splitChapters = textResponse
        .split(/\n\n\n\n+/) // Split on four or more consecutive newlines
        .filter((ch) => ch.trim());
      setChapters(splitChapters);

      // Check if image_urls exist
      // if (!message.image_urls || message.image_urls.length === 0) {
      //   console.log("No image URLs provided in message:", message);
      //   setImageUrls([]);
      //   return;
      // }

      // // Filter and validate URLs
      // const urls = message.image_urls.filter((url) => {
      //   if (!url || typeof url !== "string") {
      //     console.warn("Invalid URL filtered out:", url);
      //     return false;
      //   }
      //   // Updated validation to accept ImgBB URLs
      //   const isValidUrl = url.startsWith("https://i.ibb.co");
      //   if (!isValidUrl) {
      //     console.warn("URL does not match expected ImgBB format:", url);
      //   }
      //   return isValidUrl;
      // });

      // if (urls.length === 0) {
      //   console.log("No valid image URLs after filtering:", message.image_urls);
      //   setImageUrls([]);
      //   return;
      // }

      // console.log("Valid image URLs to be displayed:", urls);
      // setImageUrls(urls);
      // setError(null);
      // setLoading(false);
    };

    loadImagesAndChapters();
  }, [message]);

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="w-full overflow-hidden">
          <CardContent className="p-0">
            <AspectRatio ratio={1 / 1}>
              <Skeleton className="size-full rounded-none" />
            </AspectRatio>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (imageUrls.length === 0 && chapters.length === 0) {
      return (
        <Alert variant="default" className="mt-2">
          <AlertCircle className="size-4" />
          <AlertDescription>No images or chapters to display.</AlertDescription>
        </Alert>
      );
    }

    // Single image case
    if (imageUrls.length === 1) {
      return (
        <div className="w-full">
          <Card className={cn("w-full max-w-[100vw] overflow-hidden", "border-border")}>
            <CardContent className="w-full overflow-hidden p-0">
              <AspectRatio ratio={1 / 1}>
                <div className="relative size-full overflow-hidden">
                  <Image
                    src={imageUrls[0]}
                    alt="Generated Image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-all hover:scale-[102.5%]"
                    onError={(e) => {
                      console.error("Failed to load image:", imageUrls[0]);
                      setError("Failed to load image");
                      e.currentTarget.src = FALLBACK_IMAGE; // Fallback to placeholder
                    }}
                    onLoadingComplete={() => {
                      console.log("Image loaded successfully:", imageUrls[0]);
                    }}
                    priority
                  />
                </div>
              </AspectRatio>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Multiple images case (storytelling mode)
    return chapters.map((chapter, index) => (
      <div
        key={index}
        className={`w-full ${index < chapters.length - 1 ? "mb-4" : ""}`}
      >
        {index > 0 && index - 1 < imageUrls.length && (
          <Card className={cn("mb-4 w-full max-w-[100vw] overflow-hidden", "border-border")}>
            <CardContent className="w-full overflow-hidden p-0">
              <AspectRatio ratio={1 / 1}>
                <div className="relative size-full overflow-hidden">
                  <Image
                    src={imageUrls[index - 1]}
                    alt={`Chapter ${index} Image`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-all hover:scale-105"
                    onError={(e) => {
                      console.error("Failed to load chapter image:", imageUrls[index - 1]);
                      setError(`Failed to load image for chapter ${index}`);
                      e.currentTarget.src = FALLBACK_IMAGE; // Fallback to placeholder
                    }}
                    onLoadingComplete={() => {
                      console.log("Chapter image loaded successfully:", imageUrls[index - 1]);
                    }}
                    priority={index === 1}
                  />
                </div>
              </AspectRatio>
            </CardContent>
            <CardFooter className="bg-muted/50 text-muted-foreground mt-1 p-2 text-xs">
              Chapter {index} Image
            </CardFooter>
          </Card>
        )}
        <div className="text-muted-foreground hover:text-primary text-sm">
          <p>{chapter}</p>
        </div>
      </div>
    ));
  };

  return <div className="w-full">{renderContent()}</div>;
}