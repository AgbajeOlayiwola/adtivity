export const generateSessionId = (): string => {
  return (
    "ses_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

export const obfuscateAddress = (address: string | null): string | null => {
  if (!address) return null
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
}

export const getBrowserInfo = (): {
  userAgent: string | null
  language: string | null
} => {
  if (typeof navigator === "undefined") {
    return { userAgent: null, language: null }
  }
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
  }
}

export const validateApiKey = (apiKey: string): boolean => {
  return typeof apiKey === "string" && apiKey.length > 0
}
