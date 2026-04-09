export type DocumentType = "contract" | "settlement_statement";

export type NetSheetExtractResponse = {
  extract: {
    documentType: DocumentType;
    confidence?: number;
    extracted: {
      salePrice?: number | null;
      buyerCredits?: number | null;
      sellerCredits?: number | null;
      titleFees?: number | null;
      closingDate?: string | null;
      propertyAddress?: string | null;
    };
    notes?: string[];
  };
  computed: {
    netToSeller?: number | null;
  };
};

export type NetSheetFieldKey = "salePrice" | "buyerCredits" | "sellerCredits" | "titleFees";

export type NetSheetTemplateRow = {
  id: string;
  label: string;
  key: NetSheetFieldKey;
  format: "usd";
};

export const defaultNetSheetTemplate: NetSheetTemplateRow[] = [
  { id: "salePrice", label: "Sales price", key: "salePrice", format: "usd" },
  { id: "buyerCredits", label: "Buyer credits", key: "buyerCredits", format: "usd" },
  { id: "sellerCredits", label: "Seller credits", key: "sellerCredits", format: "usd" },
  { id: "titleFees", label: "Title fees (estimate)", key: "titleFees", format: "usd" },
];

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
