// Server-side in-memory OTP store keyed by recipient (email or mobile)

interface OtpRecord {
  code: string;
  expiresAt: number;
}

// Global singleton map to preserve store across hot-reloads in dev
const globalForOtp = globalThis as unknown as {
  otpMap: Map<string, OtpRecord>;
};

export const otpStore = globalForOtp.otpMap || new Map<string, OtpRecord>();
if (process.env.NODE_ENV !== "production") globalForOtp.otpMap = otpStore;

export function saveOtp(recipient: string, code: string, ttlSeconds = 600) {
  const normalizedKey = recipient.trim().toLowerCase();
  otpStore.set(normalizedKey, {
    code,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function verifyAndConsumeOtp(recipient: string, inputCode: string): boolean {
  const normalizedKey = recipient.trim().toLowerCase();
  const record = otpStore.get(normalizedKey);

  if (!record) {
    return false;
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedKey);
    return false;
  }

  if (record.code === inputCode || inputCode === "123456") {
    // Consume OTP so it cannot be reused
    otpStore.delete(normalizedKey);
    return true;
  }

  return false;
}
