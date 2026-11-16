'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PricingSettings, PackageVariation } from '@/types/marketplace';
import { PRODUCTS_CATALOG } from '@/data/catalog';
import { DEFAULT_PRICING_SETTINGS, calculateSellingPrice, recalculatePackages } from '@/lib/pricingEngine';
import { saveCustomProduct, fetchCustomProducts, deleteCustomProduct as apiDeleteProduct } from '@/lib/firebaseService';

interface MarketplaceContextType {
  products: Product[];
  pricingSettings: PricingSettings;
  updateGlobalMarkup: (newMarkup: number, newHighTierMarkup?: number) => void;
  toggleMarkupActive: (active: boolean) => void;
  overridePackagePrice: (productId: string, packageId: string, newPrice: number | null) => void;
  updateSupplierCost: (productId: string, packageId: string, supplierCost: number | null) => void;
  toggleProductStock: (productId: string, inStock: boolean) => void;
  togglePackageStock: (productId: string, packageId: string, inStock: boolean) => void;
  addProduct: (product: Product) => Promise<boolean>;
  updateProduct: (productId: string, updatedFields: Partial<Product>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  resetAllPricing: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(DEFAULT_PRICING_SETTINGS);
  const [products, setProducts] = useState<Product[]>(PRODUCTS_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');

  // Load custom products and settings / overrides
  useEffect(() => {
    async function initCatalog() {
      try {
        const customProds = await fetchCustomProducts();
        if (customProds && customProds.length > 0) {
          // Merge custom products with base catalog
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOnes = customProds.filter(p => !existingIds.has(p.id));
            const updated = prev.map(p => {
              const matched = customProds.find(cp => cp.id === p.id);
              return matched ? { ...p, ...matched } : p;
            });
            return [...newOnes, ...updated];
          });
        }

        const savedSettings = localStorage.getItem('nepal_market_pricing_settings');
        if (savedSettings) setPricingSettings({ ...DEFAULT_PRICING_SETTINGS, ...JSON.parse(savedSettings) });

        const savedOverrides = localStorage.getItem('nepal_market_product_overrides');
        if (savedOverrides) {
          const overrides: Record<string, Partial<PackageVariation>> = JSON.parse(savedOverrides);
          setProducts(prevProducts =>
            prevProducts.map(p => ({
              ...p,
              packages: p.packages.map(pkg => {
                const key = `${p.id}_${pkg.id}`;
                if (overrides[key]) {
                  return { ...pkg, ...overrides[key] };
                }
                return pkg;
              })
            }))
          );
        }
      } catch (e) {}
    }

    initCatalog();
  }, []);

  const addProduct = async (newProduct: Product): Promise<boolean> => {
    try {
      await saveCustomProduct(newProduct);
      setProducts(prev => [newProduct, ...prev]);
      return true;
    } catch (e) {
      return false;
    }
  };

  const updateProduct = async (productId: string, updatedFields: Partial<Product>): Promise<boolean> => {
    try {
      let updatedProduct: Product | undefined;
      setProducts(prev =>
        prev.map(p => {
          if (p.id === productId) {
            updatedProduct = { ...p, ...updatedFields };
            return updatedProduct;
          }
          return p;
        })
      );
      if (updatedProduct) {
        await saveCustomProduct(updatedProduct);
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      await apiDeleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      return true;
    } catch (e) {
      return false;
    }
  };

  const updateGlobalMarkup = (newMarkup: number, newHighTierMarkup?: number) => {
    const updatedSettings: PricingSettings = {
      ...pricingSettings,
      globalMarkupNpr: newMarkup,
      highTierMarkupNpr: newHighTierMarkup ?? pricingSettings.highTierMarkupNpr ?? 50,
      lastUpdated: new Date().toISOString(),
    };
    setPricingSettings(updatedSettings);
    localStorage.setItem('nepal_market_pricing_settings', JSON.stringify(updatedSettings));

    // Recalculate all products that don't have manual overrides
    setProducts(prev =>
      prev.map(prod => ({
        ...prod,
        packages: recalculatePackages(prod.packages, newMarkup, updatedSettings.highTierMarkupNpr),
      }))
    );
  };

  const toggleMarkupActive = (active: boolean) => {
    const updatedSettings: PricingSettings = {
      ...pricingSettings,
      isMarkupActive: active,
      lastUpdated: new Date().toISOString(),
    };
    setPricingSettings(updatedSettings);
    localStorage.setItem('nepal_market_pricing_settings', JSON.stringify(updatedSettings));

    setProducts(prev =>
      prev.map(prod => ({
        ...prod,
        packages: recalculatePackages(
          prod.packages, 
          active ? updatedSettings.globalMarkupNpr : 0,
          active ? (updatedSettings.highTierMarkupNpr ?? 50) : 0
        ),
      }))
    );
  };

  const overridePackagePrice = (productId: string, packageId: string, newPrice: number | null) => {
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== productId) return prod;
        return {
          ...prod,
          packages: prod.packages.map(pkg => {
            if (pkg.id !== packageId) return pkg;
            if (newPrice === null) {
              // Reset to automatic formula
              const { sellingPrice, markupNpr } = calculateSellingPrice(pkg.originalPrice, {
                markupNpr: pricingSettings.globalMarkupNpr,
                highTierMarkupNpr: pricingSettings.highTierMarkupNpr,
                highTierThresholdNpr: pricingSettings.highTierThresholdNpr,
                isMarkupActive: pricingSettings.isMarkupActive,
              });
              return { ...pkg, sellingPrice, markupNpr, isOverride: false };
            } else {
              return {
                ...pkg,
                sellingPrice: newPrice,
                markupNpr: newPrice - pkg.originalPrice,
                isOverride: true,
              };
            }
          })
        };
      })
    );
  };

  const updateSupplierCost = (productId: string, packageId: string, supplierCost: number | null) => {
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== productId) return prod;
        return {
          ...prod,
          packages: prod.packages.map(pkg => {
            if (pkg.id !== packageId) return pkg;
            return {
              ...pkg,
              supplierCost: supplierCost === null ? undefined : supplierCost,
            };
          })
        };
      })
    );
  };

  const toggleProductStock = (productId: string, inStock: boolean) => {
    setProducts(prev =>
      prev.map(prod => (prod.id === productId ? { ...prod, inStock } : prod))
    );
  };

  const togglePackageStock = (productId: string, packageId: string, inStock: boolean) => {
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== productId) return prod;
        return {
          ...prod,
          packages: prod.packages.map(pkg =>
            pkg.id === packageId ? { ...pkg, inStock } : pkg
          )
        };
      })
    );
  };

  const resetAllPricing = () => {
    localStorage.removeItem('nepal_market_pricing_settings');
    localStorage.removeItem('nepal_market_product_overrides');
    setPricingSettings(DEFAULT_PRICING_SETTINGS);
    setProducts(PRODUCTS_CATALOG);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        products,
        pricingSettings,
        updateGlobalMarkup,
        toggleMarkupActive,
        overridePackagePrice,
        updateSupplierCost,
        toggleProductStock,
        togglePackageStock,
        addProduct,
        updateProduct,
        deleteProduct,
        resetAllPricing,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
