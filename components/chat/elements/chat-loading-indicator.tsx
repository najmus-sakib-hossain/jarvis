"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Sparkles,} from "lucide-react"

export default function LoadingAnimation() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-8">
            <motion.div
                className="relative size-24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="border-primary/20 absolute inset-0 rounded-full border-4"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                />
                <motion.div
                    className="border-t-primary absolute inset-0 rounded-full border-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <Sparkles className="text-primary size-8" />
                </motion.div>
            </motion.div>
            <motion.div
                className="space-y-2 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-xl font-semibold">Initializing Friday</h2>
                <p className="text-muted-foreground">Your AI friend is waking up...</p>
            </motion.div>
        </div>
    )
}
