/**
 * Bank transfer details shown on the checkout and confirmation screens.
 * Set these in .env / Vercel environment variables.
 *
 * NEXT_PUBLIC_BANK_NAME        e.g.  "First Citizens Bank"
 * NEXT_PUBLIC_BANK_ACCOUNT_NAME  e.g.  "Jane Doe"
 * NEXT_PUBLIC_BANK_ACCOUNT_NUMBER  e.g.  "123456789"
 * NEXT_PUBLIC_BANK_BRANCH      e.g.  "Port of Spain"
 */

function readEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

export type BankDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
};

export function getBankDetails(): BankDetails {
  return {
    bankName: readEnv("NEXT_PUBLIC_BANK_NAME"),
    accountName: readEnv("NEXT_PUBLIC_BANK_ACCOUNT_NAME"),
    accountNumber: readEnv("NEXT_PUBLIC_BANK_ACCOUNT_NUMBER"),
    branch: readEnv("NEXT_PUBLIC_BANK_BRANCH"),
  };
}

export function isBankDetailsConfigured(): boolean {
  const d = getBankDetails();
  return Boolean(d.accountName && d.accountNumber);
}
