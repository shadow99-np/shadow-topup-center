import { PackageVariation, PricingSettings } from '@/types/marketplace';

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  globalMarkupNpr: 20, // Business Rule: Selling Price = Original Price + NPR 20 for <= 1,000 NPR
  highTierMarkupNpr: 50, // Business Rule: Selling Price = Original Price + NPR 50 for > 1,000 NPR
  highTierThresholdNpr: 1000, // Threshold at 1,000 NPR
  isMarkupActive: true,
  minProfitMarginPct: 5,
  lastUpdated: new Date().toISOString(),
};

/**
 * Calculates the final selling price based on the Tiered Profit Business Rule:
 * 
 * Business Rule:
 * - Anything with price <= NPR 1,000: Selling Price = Original Price + NPR 20 (Rs. 20 Profit)
 * - Anything with price > NPR 1,000:  Selling Price = Original Price + NPR 50 (Rs. 50 Profit)
 * 
 * Examples:
 * Original NPR 100   (<= 1,000) -> Markup +20 -> Selling NPR 120
 * Original NPR 500   (<= 1,000) -> Markup +20 -> Selling NPR 520
 * Original NPR 930   (<= 1,000) -> Markup +20 -> Selling NPR 950
 * Original NPR 1,048 (> 1,000)  -> Markup +50 -> Selling NPR 1,098
 * Original NPR 1,700 (> 1,000)  -> Markup +50 -> Selling NPR 1,750
 * Original NPR 3,100 (> 1,000)  -> Markup +50 -> Selling NPR 3,150
 * Original NPR 17,999 (> 1,000) -> Markup +50 -> Selling NPR 18,049
 */
export function calculateSellingPrice(
  originalPrice: number,
  options?: {
    markupNpr?: number;
    highTierMarkupNpr?: number;
    highTierThresholdNpr?: number;
    overridePrice?: number;
    isMarkupActive?: boolean;
  }
): {
  sellingPrice: number;
  markupNpr: number;
  isOverride: boolean;
} {
  const isOverride = typeof options?.overridePrice === 'number' && options.overridePrice > 0;
  if (isOverride) {
    return {
      sellingPrice: options!.overridePrice!,
      markupNpr: options!.overridePrice! - originalPrice,
      isOverride: true,
    };
  }

  const isMarkupActive = options?.isMarkupActive ?? DEFAULT_PRICING_SETTINGS.isMarkupActive;
  const threshold = options?.highTierThresholdNpr ?? DEFAULT_PRICING_SETTINGS.highTierThresholdNpr ?? 1000;
  const highTierMarkup = options?.highTierMarkupNpr ?? DEFAULT_PRICING_SETTINGS.highTierMarkupNpr ?? 50;
  const baseMarkup = options?.markupNpr ?? DEFAULT_PRICING_SETTINGS.globalMarkupNpr;

  let markupNpr = 0;
  if (isMarkupActive) {
    markupNpr = originalPrice > threshold ? highTierMarkup : baseMarkup;
  }

  // Clean rounding to whole rupees for Nepali Rupee transactions
  const finalPrice = Math.round(originalPrice + markupNpr);

  return {
    sellingPrice: finalPrice,
    markupNpr,
    isOverride: false,
  };
}

/**
 * Safely calculates profit margins while strictly distinguishing between 
 * competitor reference price and confirmed supplier cost.
 */
export function calculateProfit(
  sellingPrice: number,
  supplierCost?: number | null,
  competitorPrice?: number
): {
  costBasis: number;
  profitNpr: number;
  marginPct: number;
  isEstimated: boolean; // True if using competitor price as fallback estimate
} {
  if (typeof supplierCost === 'number' && supplierCost > 0) {
    const profit = sellingPrice - supplierCost;
    const margin = supplierCost > 0 ? (profit / sellingPrice) * 100 : 0;
    return {
      costBasis: supplierCost,
      profitNpr: Math.round(profit),
      marginPct: Math.round(margin * 10) / 10,
      isEstimated: false,
    };
  }

  // Fallback: estimate profit using tiered pricing rule
  let expectedMarkup = DEFAULT_PRICING_SETTINGS.globalMarkupNpr;
  if (typeof competitorPrice === 'number') {
    expectedMarkup = competitorPrice > (DEFAULT_PRICING_SETTINGS.highTierThresholdNpr ?? 1000)
      ? (DEFAULT_PRICING_SETTINGS.highTierMarkupNpr ?? 50)
      : DEFAULT_PRICING_SETTINGS.globalMarkupNpr;
  } else if (sellingPrice > 1050) {
    expectedMarkup = DEFAULT_PRICING_SETTINGS.highTierMarkupNpr ?? 50;
  }

  const estimatedCost = competitorPrice ?? (sellingPrice - expectedMarkup);
  const profit = sellingPrice - estimatedCost;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  return {
    costBasis: estimatedCost,
    profitNpr: Math.round(profit),
    marginPct: Math.round(margin * 10) / 10,
    isEstimated: true,
  };
}

/**
 * Apply the pricing formula to a package variation
 */
export function applyFormulaToPackage(
  pkg: PackageVariation,
  settings: PricingSettings = DEFAULT_PRICING_SETTINGS
): PackageVariation {
  if (pkg.isOverride && pkg.sellingPrice) {
    return pkg;
  }

  const { sellingPrice, markupNpr } = calculateSellingPrice(pkg.originalPrice, {
    markupNpr: settings.globalMarkupNpr,
    highTierMarkupNpr: settings.highTierMarkupNpr,
    highTierThresholdNpr: settings.highTierThresholdNpr,
    isMarkupActive: settings.isMarkupActive,
  });

  return {
    ...pkg,
    markupNpr,
    sellingPrice,
  };
}

/**
 * Recalculate an array of packages with a new markup setting
 */
export function recalculatePackages(
  packages: PackageVariation[],
  newMarkupNpr: number,
  newHighTierMarkupNpr?: number
): PackageVariation[] {
  return packages.map((pkg) => {
    if (pkg.isOverride) return pkg;
    const { sellingPrice, markupNpr } = calculateSellingPrice(pkg.originalPrice, {
      markupNpr: newMarkupNpr,
      highTierMarkupNpr: newHighTierMarkupNpr ?? (newMarkupNpr === 20 ? 50 : newMarkupNpr),
      isMarkupActive: true,
    });
    return {
      ...pkg,
      markupNpr,
      sellingPrice,
    };
  });
}

/**
 * Helper to format Nepali Rupees nicely: "Rs. 1,020" or "NPR 1,020"
 */
export function formatNpr(amount: number, style: 'Rs.' | 'NPR' = 'Rs.'): string {
  if (isNaN(amount)) return `${style} 0`;
  const formatted = Math.round(amount).toLocaleString('en-IN');
  return `${style} ${formatted}`;
}
