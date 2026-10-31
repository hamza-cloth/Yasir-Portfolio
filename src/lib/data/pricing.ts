import "server-only";

import { getSiteConfig } from "@/lib/data/site-config";
import { priceTableWith, type PriceTable } from "@/lib/estimate";

// The calculator's prices: the config defaults with the admin's overrides (admin → Pricing).
export async function getPriceTable(): Promise<PriceTable> {
  return priceTableWith(await getSiteConfig("pricing"));
}
