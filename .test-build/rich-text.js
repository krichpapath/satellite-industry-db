"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRichText = sanitizeRichText;
exports.richTextToPlainText = richTextToPlainText;
const ALLOWED_TAGS = new Set([
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "blockquote",
    "div",
    "span"
]);
function sanitizeRichText(value) {
    const input = String(value ?? "").trim();
    if (!input)
        return "";
    return input
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<(script|style|iframe|object|embed|img|a|table|thead|tbody|tr|td|th)[\s\S]*?<\/\1>/gi, "")
        .replace(/<(script|style|iframe|object|embed|img|a|table|thead|tbody|tr|td|th)\b[^>]*\/?>/gi, "")
        .replace(/<\/?([a-z0-9-]+)(?:\s[^>]*)?>/gi, (match, tag) => {
        const normalized = tag.toLowerCase();
        if (!ALLOWED_TAGS.has(normalized))
            return "";
        return match.startsWith("</") ? `</${normalized}>` : `<${normalized}>`;
    });
}
function richTextToPlainText(value) {
    return sanitizeRichText(value)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|li|blockquote)>/gi, "\n")
        .replace(/<li>/gi, "- ")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
