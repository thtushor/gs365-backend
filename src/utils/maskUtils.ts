/**
 * Mask a phone number: show first 2 and last 2 digits
 * e.g., "01712345699" => "01*****99"
 */
export const maskPhone = (phone: string): string => {
    if (!phone || phone.length < 5) return phone;
    const first2 = phone.slice(0, 2);
    const last2 = phone.slice(-2);
    const masked = "*".repeat(phone.length - 4);
    return `${first2}${masked}${last2}`;
};

/**
 * Mask an email: show first 2 chars, mask rest before @
 * e.g., "user@email.com" => "us***@email.com"
 */
export const maskEmail = (email: string): string => {
    if (!email || !email.includes("@")) return email;
    const [local, domain] = email.split("@");
    if (local.length <= 2) return `${local}***@${domain}`;
    const first2 = local.slice(0, 2);
    const masked = "***";
    return `${first2}${masked}@${domain}`;
};
