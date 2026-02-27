export const VEXORA_WAY_CODES: Record<string, string> = {
    bkash: "BKASH",
    nagad: "NAGAD",
    // rocket: "ROCKET",
    // upay: "UPAY",
};

export const getVexoraWayCode = (network: string): string | null => {
    return VEXORA_WAY_CODES[network.toLowerCase()] || null;
};
