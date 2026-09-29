"use client";

import { useCallback, useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import AddAssetForm from "@/components/AddAssetForm";
import AssetList from "@/components/AssetList";
import Card from "@/components/Card";
import { useAuth } from "@/lib/auth-context";
import {
  Asset,
  NewAsset,
  addAsset,
  deleteAsset,
  fetchAssets,
  sumExpectedMaturity,
  sumInvested,
  updateAsset
} from "@/lib/assets";
import { formatCurrency } from "@/lib/expenses";

export default function AssetsPage() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // `showLoading` is false for refetches after add/edit/delete — those
  // should update the list in place, not replace the whole page with the
  // "Loading…" placeholder like the very first load does (that full-page
  // swap read as the page reloading after sliding to confirm).
  const loadData = useCallback(
    async (showLoading = true) => {
      if (!userId) return;
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const data = await fetchAssets(userId);
        setAssets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load assets.");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAdd(input: NewAsset) {
    if (!userId) return;
    await addAsset(userId, input);
    await loadData(false);
  }

  async function handleEdit(id: string, input: NewAsset) {
    await updateAsset(id, input);
    await loadData(false);
  }

  async function handleDelete(id: string) {
    await deleteAsset(id);
    await loadData(false);
  }

  return (
    <RequireAuth>
      <Header title="Total Asset" />
      <main className="mx-auto max-w-md px-5 py-8 pb-24 md:max-w-2xl lg:max-w-4xl">
        {error && <p className="mb-6 font-body text-sm text-rust">{error}</p>}

        {loading ? (
          <p className="font-body text-sm text-ink/50">Loading…</p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <p className="text-center font-body text-xs text-ink/60">Invested</p>
                <p className="mt-1 break-all text-center font-display text-2xl text-ink">
                  {formatCurrency(sumInvested(assets))}
                </p>
              </Card>
              <Card>
                <p className="text-center font-body text-xs text-ink/60">
                  Expected at maturity
                </p>
                <p className="mt-1 break-all text-center font-display text-2xl text-ink">
                  {formatCurrency(sumExpectedMaturity(assets))}
                </p>
              </Card>
            </div>

            <Card>
              <AddAssetForm onAdd={handleAdd} />
            </Card>

            <Card title="Holdings">
              <AssetList assets={assets} onEdit={handleEdit} onDelete={handleDelete} />
            </Card>
          </div>
        )}
      </main>
      <BottomNav />
    </RequireAuth>
  );
}
