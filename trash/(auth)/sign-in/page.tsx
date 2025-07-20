"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { Loader2, Key, CircleDotDashed } from "lucide-react";
import { signIn } from "@/lib/auth/auth-client";
import Link from "next/link";
import { cn, lt } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import type { SVGProps } from "react";
import { toast } from "sonner";

const Google = (props: SVGProps<SVGSVGElement>) => <svg width="1em" height="1em" viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" {...props}><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" /><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" /><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" /><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" /></svg>;
const Facebook = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="url(#a)" height="1em" width="1em" {...props}><defs><linearGradient x1="50%" x2="50%" y1="97.078%" y2="0%" id="a"><stop offset="0%" stopColor="#0062E0" /><stop offset="100%" stopColor="#19AFFF" /></linearGradient></defs><path d="M15 35.8C6.5 34.3 0 26.9 0 18 0 8.1 8.1 0 18 0s18 8.1 18 18c0 8.9-6.5 16.3-15 17.8l-1-.8h-4l-1 .8z" /><path fill="#FFF" d="m25 23 .8-5H21v-3.5c0-1.4.5-2.5 2.7-2.5H26V7.4c-1.3-.2-2.7-.4-4-.4-4.1 0-7 2.5-7 7v4h-4.5v5H15v12.7c1 .2 2 .3 3 .3s2-.1 3-.3V23h4z" /></svg>;
const XformerlyTwitter = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 1200 1227" {...props}><path fill="#000" d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" /></svg>;
const TikTok = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 290" width="1em" height="1em" {...props}><path fill="#FF004F" d="M189.72022 104.42148c18.67797 13.3448 41.55932 21.19661 66.27233 21.19661V78.08728c-4.67694.001-9.34196-.48645-13.91764-1.4554v37.41351c-24.71102 0-47.5894-7.85181-66.27232-21.19563v96.99656c0 48.5226-39.35537 87.85513-87.8998 87.85513-18.11308 0-34.94847-5.47314-48.93361-14.85978 15.96175 16.3122 38.22162 26.4315 62.84826 26.4315 48.54742 0 87.90477-39.33253 87.90477-87.85712v-96.99457h-.00199Zm17.16896-47.95275c-9.54548-10.4231-15.81283-23.89299-17.16896-38.78453v-6.11347h-13.18894c3.31982 18.92715 14.64335 35.09738 30.3579 44.898ZM69.67355 225.60685c-5.33316-6.9891-8.21517-15.53882-8.20226-24.3298 0-22.19236 18.0009-40.18631 40.20915-40.18631 4.13885-.001 8.2529.6324 12.19716 1.88328v-48.59308c-4.60943-.6314-9.26154-.89945-13.91167-.80117v37.82253c-3.94726-1.25089-8.06328-1.88626-12.20313-1.88229-22.20825 0-40.20815 17.99196-40.20815 40.1873 0 15.6937 8.99747 29.28075 22.1189 35.89954Z" /><path d="M175.80259 92.84876c18.68293 13.34382 41.5613 21.19563 66.27232 21.19563V76.63088c-13.79353-2.93661-26.0046-10.14114-35.18573-20.16215-15.71554-9.80162-27.03808-25.97185-30.3579-44.898H141.8876v189.84333c-.07843 22.1318-18.04855 40.05229-40.20915 40.05229-13.05889 0-24.66039-6.22169-32.00788-15.8595-13.12044-6.61879-22.1179-20.20683-22.1179-35.89854 0-22.19336 17.9999-40.1873 40.20815-40.1873 4.255 0 8.35614.66217 12.20312 1.88229v-37.82254c-47.69165.98483-86.0473 39.93316-86.0473 87.83429 0 23.91184 9.55144 45.58896 25.05353 61.4276 13.98514 9.38565 30.82053 14.85978 48.9336 14.85978 48.54544 0 87.89981-39.33452 87.89981-87.85612V92.84876h-.00099Z" /><path fill="#00F2EA" d="M242.07491 76.63088V66.51456c-12.4384.01886-24.6326-3.46278-35.18573-10.04683 9.34196 10.22255 21.64336 17.27121 35.18573 20.16315Zm-65.54363-65.06015a67.7881 67.7881 0 0 1-.72869-5.45726V0h-47.83362v189.84531c-.07644 22.12883-18.04557 40.04931-40.20815 40.04931-6.50661 0-12.64987-1.54375-18.09025-4.28677 7.34749 9.63681 18.949 15.8575 32.00788 15.8575 22.15862 0 40.13171-17.9185 40.20915-40.0503V11.57073h34.64368ZM99.96593 113.58077V102.8112c-3.9969-.54602-8.02655-.82003-12.06116-.81805C39.35537 101.99315 0 141.32669 0 189.84531c0 30.41846 15.46735 57.22621 38.97116 72.99536-15.5021-15.83765-25.05353-37.51576-25.05353-61.42661 0-47.90014 38.35466-86.84847 86.0483-87.8333Z" /></svg>;
const Discord = (props: SVGProps<SVGSVGElement>) => <svg viewBox="0 0 256 199" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" {...props}><path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z" fill="#5865F2" /></svg>;
const Twitch = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" viewBox="0 0 2400 2800" width="1em" height="1em" {...props}><path fill="#fff" d="m2200 1300-400 400h-400l-350 350v-350H600V200h1600z" /><g fill="#9146ff"><path d="M500 0 0 500v1800h600v500l500-500h400l900-900V0H500zm1700 1300-400 400h-400l-350 350v-350H600V200h1600v1100z" /><path d="M1700 550h200v600h-200zm-550 0h200v600h-200z" /></g></svg>;

const Microsoft = (props: SVGProps<SVGSVGElement>) => <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" preserveAspectRatio="xMidYMid" {...props}><path fill="#F1511B" d="M121.666 121.666H0V0h121.666z" /><path fill="#80CC28" d="M256 121.666H134.335V0H256z" /><path fill="#00ADEF" d="M121.663 256.002H0V134.336h121.663z" /><path fill="#FBBC09" d="M256 256.002H134.335V134.336H256z" /></svg>;
const Apple = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="1em" height="1em" viewBox="0 0 814 1000" {...props}><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" /></svg>;
const GitHub = (props: SVGProps<SVGSVGElement>) => <svg width="1em" height="1em" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill="#1B1F23" /></svg>;
const Kick = (props: SVGProps<SVGSVGElement>) => <svg width="1em" height="1em" viewBox="0 0 933 300" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><g clipPath="url(#clip0_9790_492437)"><g clipPath="url(#clip1_9790_492437)"><path fillRule="evenodd" clipRule="evenodd" d="M0 0H100V66.6667H133.333V33.3333H166.667V0H266.667V100H233.333V133.333H200V166.667H233.333V200H266.667V300H166.667V266.667H133.333V233.333H100V300H0V0ZM666.667 0H766.667V66.6667H800V33.3333H833.333V0H933.333V100H900V133.333H866.667V166.667H900V200H933.333V300H833.333V266.667H800V233.333H766.667V300H666.667V0ZM300 0H400V300H300V0ZM533.333 0H466.667V33.3333H433.333V266.667H466.667V300H533.333H633.333V200H533.333V100H633.333V0H533.333Z" fill="#53FC18" /></g></g><defs><clipPath id="clip0_9790_492437"><rect width={933} height={300} fill="white" /></clipPath><clipPath id="clip1_9790_492437"><rect width={933.333} height={300} fill="white" /></clipPath></defs></svg>;
const LinkedIn = (props: SVGProps<SVGSVGElement>) => <svg width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256" {...props}><path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453" fill="#0A66C2" /></svg>;
const Dropbox = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 128 128" width="1em" height="1em" {...props}><path fill="#0061FE" d="M0 0h128v128H0z" /><path fill="#F7F5F2" d="M43.7 32 23.404 44.75 43.701 57.5 64 44.75 84.3 57.5l20.298-12.75L84.299 32 64.002 44.75 43.7 32Zm0 51L23.404 70.25 43.701 57.5 64 70.25 43.702 83Zm20.302-12.75L84.299 57.5l20.298 12.75L84.299 83 64.002 70.25Zm0 29.75L43.7 87.25 64 74.5l20.3 12.75L64.002 100Z" /></svg>;
const GitLab = (props: SVGProps<SVGSVGElement>) => <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-labelledby="tanukiHomeDesktop" width="1em" height="1em" {...props}><path d="m31.46 12.78-.04-.12-4.35-11.35A1.14 1.14 0 0 0 25.94.6c-.24 0-.47.1-.66.24-.19.15-.33.36-.39.6l-2.94 9h-11.9l-2.94-9A1.14 1.14 0 0 0 6.07.58a1.15 1.15 0 0 0-1.14.72L.58 12.68l-.05.11a8.1 8.1 0 0 0 2.68 9.34l.02.01.04.03 6.63 4.97 3.28 2.48 2 1.52a1.35 1.35 0 0 0 1.62 0l2-1.52 3.28-2.48 6.67-5h.02a8.09 8.09 0 0 0 2.7-9.36Z" fill="#E24329" /><path d="m31.46 12.78-.04-.12a14.75 14.75 0 0 0-5.86 2.64l-9.55 7.24 6.09 4.6 6.67-5h.02a8.09 8.09 0 0 0 2.67-9.36Z" fill="#FC6D26" /><path d="m9.9 27.14 3.28 2.48 2 1.52a1.35 1.35 0 0 0 1.62 0l2-1.52 3.28-2.48-6.1-4.6-6.07 4.6Z" fill="#FCA326" /><path d="M6.44 15.3a14.71 14.71 0 0 0-5.86-2.63l-.05.12a8.1 8.1 0 0 0 2.68 9.34l.02.01.04.03 6.63 4.97 6.1-4.6-9.56-7.24Z" fill="#FC6D26" /></svg>;
const Reddit = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="_1O4jTk-dZ-VIxsCuYB6OR8" viewBox="0 0 216 216" width="1em" height="1em" {...props}><defs><radialGradient id="snoo-radial-gragient" cx={169.75} cy={92.19} r={50.98} fx={169.75} fy={92.19} gradientTransform="matrix(1 0 0 .87 0 11.64)" gradientUnits="userSpaceOnUse"><stop offset={0} stopColor="#feffff" /><stop offset={0.4} stopColor="#feffff" /><stop offset={0.51} stopColor="#f9fcfc" /><stop offset={0.62} stopColor="#edf3f5" /><stop offset={0.7} stopColor="#dee9ec" /><stop offset={0.72} stopColor="#d8e4e8" /><stop offset={0.76} stopColor="#ccd8df" /><stop offset={0.8} stopColor="#c8d5dd" /><stop offset={0.83} stopColor="#ccd6de" /><stop offset={0.85} stopColor="#d8dbe2" /><stop offset={0.88} stopColor="#ede3e9" /><stop offset={0.9} stopColor="#ffebef" /></radialGradient><radialGradient xlinkHref="#snoo-radial-gragient" id="snoo-radial-gragient-2" cx={47.31} r={50.98} fx={47.31} fy={64.68} /><radialGradient xlinkHref="#snoo-radial-gragient" id="snoo-radial-gragient-3" cx={109.61} cy={85.59} r={153.78} fx={109.61} fy={85.59} gradientTransform="matrix(1 0 0 .7 0 25.56)" /><radialGradient id="snoo-radial-gragient-4" cx={-6.01} cy={64.68} r={12.85} fx={-6.01} fy={64.68} gradientTransform="matrix(1.07 0 0 1.55 81.08 27.26)" gradientUnits="userSpaceOnUse"><stop offset={0} stopColor="#f60" /><stop offset={0.5} stopColor="#ff4500" /><stop offset={0.7} stopColor="#fc4301" /><stop offset={0.82} stopColor="#f43f07" /><stop offset={0.92} stopColor="#e53812" /><stop offset={1} stopColor="#d4301f" /></radialGradient><radialGradient xlinkHref="#snoo-radial-gragient-4" id="snoo-radial-gragient-5" cx={-73.55} cy={64.68} r={12.85} fx={-73.55} fy={64.68} gradientTransform="matrix(-1.07 0 0 1.55 62.87 27.26)" /><radialGradient id="snoo-radial-gragient-6" cx={107.93} cy={166.96} r={45.3} fx={107.93} fy={166.96} gradientTransform="matrix(1 0 0 .66 0 57.4)" gradientUnits="userSpaceOnUse"><stop offset={0} stopColor="#172e35" /><stop offset={0.29} stopColor="#0e1c21" /><stop offset={0.73} stopColor="#030708" /><stop offset={1} /></radialGradient><radialGradient xlinkHref="#snoo-radial-gragient" id="snoo-radial-gragient-7" cx={147.88} cy={32.94} r={39.77} fx={147.88} fy={32.94} gradientTransform="matrix(1 0 0 .98 0 .54)" /><radialGradient id="snoo-radial-gragient-8" cx={131.31} cy={73.08} r={32.6} fx={131.31} fy={73.08} gradientUnits="userSpaceOnUse"><stop offset={0.48} stopColor="#7a9299" /><stop offset={0.67} stopColor="#172e35" /><stop offset={0.75} /><stop offset={0.82} stopColor="#172e35" /></radialGradient><style>{"\n            .snoo-cls-11{stroke-width:0;fill:#ffc49c}\n        "}</style></defs><path fill="#ff4500" strokeWidth={0} d="M108 0C48.35 0 0 48.35 0 108c0 29.82 12.09 56.82 31.63 76.37l-20.57 20.57C6.98 209.02 9.87 216 15.64 216H108c59.65 0 108-48.35 108-108S167.65 0 108 0Z" /><circle cx={169.22} cy={106.98} r={25.22} fill="url(#snoo-radial-gragient)" strokeWidth={0} /><circle cx={46.78} cy={106.98} r={25.22} fill="url(#snoo-radial-gragient-2)" strokeWidth={0} /><ellipse cx={108.06} cy={128.64} fill="url(#snoo-radial-gragient-3)" strokeWidth={0} rx={72} ry={54} /><path fill="url(#snoo-radial-gragient-4)" strokeWidth={0} d="M86.78 123.48c-.42 9.08-6.49 12.38-13.56 12.38s-12.46-4.93-12.04-14.01c.42-9.08 6.49-15.02 13.56-15.02s12.46 7.58 12.04 16.66Z" /><path fill="url(#snoo-radial-gragient-5)" strokeWidth={0} d="M129.35 123.48c.42 9.08 6.49 12.38 13.56 12.38s12.46-4.93 12.04-14.01c-.42-9.08-6.49-15.02-13.56-15.02s-12.46 7.58-12.04 16.66Z" /><ellipse cx={79.63} cy={116.37} className="snoo-cls-11" rx={2.8} ry={3.05} /><ellipse cx={146.21} cy={116.37} className="snoo-cls-11" rx={2.8} ry={3.05} /><path fill="url(#snoo-radial-gragient-6)" strokeWidth={0} d="M108.06 142.92c-8.76 0-17.16.43-24.92 1.22-1.33.13-2.17 1.51-1.65 2.74 4.35 10.39 14.61 17.69 26.57 17.69s22.23-7.3 26.57-17.69c.52-1.23-.33-2.61-1.65-2.74-7.77-.79-16.16-1.22-24.92-1.22Z" /><circle cx={147.49} cy={49.43} r={17.87} fill="url(#snoo-radial-gragient-7)" strokeWidth={0} /><path fill="url(#snoo-radial-gragient-8)" strokeWidth={0} d="M107.8 76.92c-2.14 0-3.87-.89-3.87-2.27 0-16.01 13.03-29.04 29.04-29.04 2.14 0 3.87 1.73 3.87 3.87s-1.73 3.87-3.87 3.87c-11.74 0-21.29 9.55-21.29 21.29 0 1.38-1.73 2.27-3.87 2.27Z" /><path fill="#842123" strokeWidth={0} d="M62.82 122.65c.39-8.56 6.08-14.16 12.69-14.16 6.26 0 11.1 6.39 11.28 14.33.17-8.88-5.13-15.99-12.05-15.99s-13.14 6.05-13.56 15.2c-.42 9.15 4.97 13.83 12.04 13.83h.52c-6.44-.16-11.3-4.79-10.91-13.2Zm90.48 0c-.39-8.56-6.08-14.16-12.69-14.16-6.26 0-11.1 6.39-11.28 14.33-.17-8.88 5.13-15.99 12.05-15.99 7.07 0 13.14 6.05 13.56 15.2.42 9.15-4.97 13.83-12.04 13.83h-.52c6.44-.16 11.3-4.79 10.91-13.2Z" /></svg>;
const Roblox = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 564 115" width="1em" height="1em" {...props}><mask id="prefix__a" width={512} height={95} x={26} y={10} maskUnits="userSpaceOnUse" style={{
  maskType: "luminance"
}}><path fill="#fff" d="M26 10h512v94.72H26V10z" /></mask><g mask="url(#prefix__a)"><path fill="#000" d="M87.73 71.45l14.73 26.97H75.13L62.68 75.37h-11.8v23.05H26V16.7h45.52c18.83 0 30.78 10.45 30.78 29.24 0 12.1-5.57 20.76-14.57 25.5zm-36.84-33.5v16.17h17.68c5.24 0 8.52-3.1 8.52-8.17 0-5.06-3.28-8-8.52-8H50.9zm130.66 66.51l-74.5-20.1L127.03 10l37.24 10.05 37.25 10.05-19.97 74.36zm-14.08-54.75L146.67 44l-5.56 20.76 20.79 5.72 5.57-20.76zm119.36 25.66c0 15.69-9.99 23.05-25.54 23.05h-48.8V16.7h47.16c15.56 0 25.54 8 25.54 22.06 0 8.83-3.27 14.71-9.5 18.8 7.05 3.1 11.14 9.3 11.14 17.8zm-50.1-39.05v12.1h16.2c4.42 0 7.04-1.97 7.04-6.22 0-3.92-2.62-5.88-7.04-5.88h-16.2zm0 42.49h18.17c4.26 0 6.72-2.29 6.72-6.21 0-4.25-2.45-6.21-6.72-6.21h-18.17V78.8zm62.38-62.1h24.88v57.52h35.7v24.19H299.1V16.71zm152.11 40.86a42.43 42.43 0 01-26.28 39.25 42.64 42.64 0 01-46.4-9.21 42.46 42.46 0 0130.1-72.53 42.56 42.56 0 0130.13 12.41 42.38 42.38 0 0112.45 30.07zm-24.89 0c0-10.14-8.02-18.15-17.68-18.15s-17.69 8.01-17.69 18.15c0 10.13 8.03 18.14 17.69 18.14 9.66 0 17.68-8.02 17.68-18.15zm84.82-1.31L538 98.42h-29.64l-14.73-24.03-15.23 24.03h-30.13l28-41.18-25.7-40.53h29.63l13.59 22.06 13.1-22.06h29.47l-25.21 39.55z" /></g></svg>;
const Spotify = (props: SVGProps<SVGSVGElement>) => <svg viewBox="0 0 256 256" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" {...props}><path d="M128 0C57.308 0 0 57.309 0 128c0 70.696 57.309 128 128 128 70.697 0 128-57.304 128-128C256 57.314 198.697.007 127.998.007l.001-.006Zm58.699 184.614c-2.293 3.76-7.215 4.952-10.975 2.644-30.053-18.357-67.885-22.515-112.44-12.335a7.981 7.981 0 0 1-9.552-6.007 7.968 7.968 0 0 1 6-9.553c48.76-11.14 90.583-6.344 124.323 14.276 3.76 2.308 4.952 7.215 2.644 10.975Zm15.667-34.853c-2.89 4.695-9.034 6.178-13.726 3.289-34.406-21.148-86.853-27.273-127.548-14.92-5.278 1.594-10.852-1.38-12.454-6.649-1.59-5.278 1.386-10.842 6.655-12.446 46.485-14.106 104.275-7.273 143.787 17.007 4.692 2.89 6.175 9.034 3.286 13.72v-.001Zm1.345-36.293C162.457 88.964 94.394 86.71 55.007 98.666c-6.325 1.918-13.014-1.653-14.93-7.978-1.917-6.328 1.65-13.012 7.98-14.935C93.27 62.027 168.434 64.68 215.929 92.876c5.702 3.376 7.566 10.724 4.188 16.405-3.362 5.69-10.73 7.565-16.4 4.187h-.006Z" fill="#1ED760" /></svg>;
const Zoom = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256" {...props}><defs><linearGradient id="a" x1="23.666%" x2="76.334%" y1="95.6118%" y2="4.3882%"><stop offset=".00006%" stopColor="#0845BF" /><stop offset="19.11%" stopColor="#0950DE" /><stop offset="38.23%" stopColor="#0B59F6" /><stop offset="50%" stopColor="#0B5CFF" /><stop offset="67.32%" stopColor="#0E5EFE" /><stop offset="77.74%" stopColor="#1665FC" /><stop offset="86.33%" stopColor="#246FF9" /><stop offset="93.88%" stopColor="#387FF4" /><stop offset="100%" stopColor="#4F90EE" /></linearGradient></defs><path fill="url(#a)" d="M256 128c0 13.568-1.024 27.136-3.328 40.192-6.912 43.264-41.216 77.568-84.48 84.48C155.136 254.976 141.568 256 128 256c-13.568 0-27.136-1.024-40.192-3.328-43.264-6.912-77.568-41.216-84.48-84.48C1.024 155.136 0 141.568 0 128c0-13.568 1.024-27.136 3.328-40.192 6.912-43.264 41.216-77.568 84.48-84.48C100.864 1.024 114.432 0 128 0c13.568 0 27.136 1.024 40.192 3.328 43.264 6.912 77.568 41.216 84.48 84.48C254.976 100.864 256 114.432 256 128Z" /><path fill="#FFF" d="M204.032 207.872H75.008c-8.448 0-16.64-4.608-20.48-12.032-4.608-8.704-2.816-19.2 4.096-26.112l89.856-89.856H83.968c-17.664 0-32-14.336-32-32h118.784c8.448 0 16.64 4.608 20.48 12.032 4.608 8.704 2.816 19.2-4.096 26.112l-89.6 90.112h74.496c17.664 0 32 14.08 32 31.744Z" /></svg>;

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
      <CardTitle className="text-lg md:text-xl">{lt("sign-in", "Sign In")}</CardTitle>
      <CardDescription className="text-xs md:text-sm">
        {lt("enter-login-details", "Enter your login details.")}
      </CardDescription>
    </CardHeader>
      <CardContent className="py-0">
        <div className="grid gap-4">          <div className="grid gap-2">          <Label htmlFor="email">{lt("email", "Email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={lt("email", "Email")}
            required
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            value={email} />
        </div>
          <div className="grid gap-2">
            <div className="flex items-center">              <Label htmlFor="password">{lt("password", "Password")}</Label>
              <Link
                href="#"
                className="ml-auto inline-block text-sm underline"
              >
                {lt("forgot-password", "Forgot password?")}
              </Link>
            </div>

            <Input
              id="password"
              type="password"
              placeholder={lt("password", "Password")}
              autoComplete="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              onClick={() => {
                setRememberMe(!rememberMe);
              }} />
            <Label htmlFor="remember">{lt("remember-me", "Remember me")}</Label>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              await signIn.email(
                {
                  email,
                  password
                },
                {
                  onRequest: (ctx) => {
                    setLoading(true);
                  },
                  onResponse: (ctx) => {
                    setLoading(false);
                  },
                },
              );
            }}
          >
            {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <p>{lt("sign-in", "Sign In")}</p>
          )}
          </Button>          <div className="w-full flex flex-row space-x-2 items-center">
            <Separator className="max-w-1/3" />
            <span className="text-center text-sm text-muted-foreground flex-1">{lt("or-continue-with", "Or continue with")}</span>
            <Separator className="max-w-1/3" />
          </div>

          <div className={cn(
            "w-full gap-2 flex items-center",
            "justify-between flex-row"
          )}>
            <Button
              variant="outline"

              disabled={loading}
              onClick={async () => {
                await signIn.social(
                  {
                    provider: "google",
                  },
                  {
                    onRequest: (ctx) => {
                      setLoading(true);
                    },
                    onResponse: (ctx) => {
                      setLoading(false);
                    },
                  },
                );
              }}
            >
              <Google />
            </Button>
            <Button
              variant="outline"

              disabled={loading}
              onClick={async () => {
                await signIn.social(
                  {
                    provider: "github",
                  },
                  {
                    onRequest: (ctx) => {
                      setLoading(true);
                    },
                    onResponse: (ctx) => {
                      setLoading(false);
                    },
                  },
                );
              }}
            >
              {/* <Facebook /> */}
              <GitHub className="invert-0 dark:invert" />
            </Button>
            <Button
              variant="outline"

              disabled={loading}
              onClick={async () => {
                await signIn.social(
                  {
                    provider: "twitter",
                  },
                  {
                    onRequest: (ctx) => {
                      setLoading(true);
                    },
                    onResponse: (ctx) => {
                      setLoading(false);
                    },
                  },
                );
              }}
            >
              <XformerlyTwitter className="invert-0 dark:invert" />
            </Button>
            <Button
              variant="outline"

              disabled={loading}
              onClick={async () => {
                await signIn.social(
                  {
                    provider: "spotify",
                  },
                  {
                    onRequest: (ctx) => {
                      setLoading(true);
                    },
                    onResponse: (ctx) => {
                      setLoading(false);
                    },
                  },
                );
              }}
            >
              <Spotify />
            </Button>
            <Button
              variant="outline"

              disabled={loading}
              onClick={async () => {
                await signIn.social(
                  {
                    provider: "discord",
                  },
                  {
                    onRequest: (ctx) => {
                      setLoading(true);
                    },
                    onResponse: (ctx) => {
                      setLoading(false);
                    },
                  },
                );
              }}
            >
              <Discord />
            </Button>
            <Button
              variant="outline"

              disabled={loading}
              onClick={async () => {
                await signIn.social(
                  {
                    provider: "zoom",
                  },
                  {
                    onRequest: (ctx) => {
                      setLoading(true);
                    },
                    onResponse: (ctx) => {
                      setLoading(false);
                    },
                  },
                );
              }}
            >
              <Zoom />
            </Button>
            <Button
              variant="outline"

              disabled={loading}
              onClick={async () => {
                await signIn.social(
                  {
                    provider: "reddit",
                  },
                  {
                    onRequest: (ctx) => {
                      setLoading(true);
                    },
                    onResponse: (ctx) => {
                      setLoading(false);
                    },
                  },
                );
              }}
            >
              {/* <CircleDotDashed className="w-4 h-4" /> */}
              <Reddit />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-0">
        <div className="flex justify-center w-full">
        <p className="text-center text-xs text-muted-foreground">
          {lt("no-account", "Don't have an account?")}{" "}
          <Link
            href="/sign-up"
            className="hover:underline"
          >
            <span className="text-primary">{lt("create-account", "Create Account")}</span>
          </Link>
        </p>
      </div>
      </CardFooter>
    </Card>
  );
}
