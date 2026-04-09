import { collection, doc } from "firebase/firestore";
import { getFirebaseDb } from "./client";

export function companyIdFromClaims(_claims?: unknown) {
  // MVP: we expect companyId custom claim; until then, we’ll use the user UID as companyId.
  // CompanyId resolution will be tightened once backend sets claims.
  return null as string | null;
}

export function companiesCol() {
  return collection(getFirebaseDb(), "companies");
}

export function companyRef(companyId: string) {
  return doc(getFirebaseDb(), "companies", companyId);
}

export function companyCollection(companyId: string, name: string) {
  return collection(getFirebaseDb(), "companies", companyId, name);
}

