"use client";

import { useState } from "react";
import { Asset, NewAsset } from "@/lib/assets";
import { formatCurrency, formatDate } from "@/lib/expenses";
import AssetForm from "./AssetForm";

const COLUMN_COUNT = 9;

export default function AssetList({
  assets,
  onEdit,
  onDelete
}: {
  assets: Asset[];
  onEdit: (id: string, input: NewAsset) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (assets.length === 0) {
    return (
      <p className="font-body text-sm text-ink/50">No assets added yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse font-body text-xs">
        <thead>
          <tr className="border-b border-line text-center text-ink/60">
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Asset name</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Type</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Status</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Start date</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">End date</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">Account / folio</th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">
              Amount invested
            </th>
            <th className="whitespace-nowrap py-2 pr-4 font-normal">
              Expected at maturity
            </th>
            <th className="whitespace-nowrap py-2 font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) =>
            editingId === asset.id ? (
              <tr key={asset.id} className="border-b border-line">
                <td colSpan={COLUMN_COUNT} className="py-4">
                  <AssetForm
                    initial={{
                      asset_name: asset.asset_name,
                      asset_type: asset.asset_type,
                      status: asset.status,
                      start_date: asset.start_date ?? "",
                      end_date: asset.end_date ?? "",
                      account_number: asset.account_number ?? "",
                      amount_invested: asset.amount_invested,
                      amount_expected_maturity:
                        asset.amount_expected_maturity !== null
                          ? String(asset.amount_expected_maturity)
                          : ""
                    }}
                    submitLabel="Save changes"
                    onSubmit={async (input) => {
                      await onEdit(asset.id, input);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr key={asset.id} className="border-b border-line text-center text-ink">
                <td className="whitespace-nowrap py-3 pr-4">{asset.asset_name}</td>
                <td className="whitespace-nowrap py-3 pr-4">{asset.asset_type}</td>
                <td className="whitespace-nowrap py-3 pr-4">{asset.status}</td>
                <td className="whitespace-nowrap py-3 pr-4">
                  {asset.start_date ? formatDate(asset.start_date) : "—"}
                </td>
                <td className="whitespace-nowrap py-3 pr-4">
                  {asset.end_date ? formatDate(asset.end_date) : "—"}
                </td>
                <td className="whitespace-nowrap py-3 pr-4">
                  {asset.account_number || "—"}
                </td>
                <td className="whitespace-nowrap py-3 pr-4">
                  {formatCurrency(asset.amount_invested)}
                </td>
                <td className="whitespace-nowrap py-3 pr-4">
                  {asset.amount_expected_maturity !== null
                    ? formatCurrency(asset.amount_expected_maturity)
                    : "—"}
                </td>
                <td className="whitespace-nowrap py-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setEditingId(asset.id)}
                      className="text-ink/40 underline decoration-line underline-offset-4 transition hover:text-ink"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      disabled={deletingId === asset.id}
                      className="text-ink/40 underline decoration-line underline-offset-4 transition hover:text-rust disabled:opacity-50"
                    >
                      {deletingId === asset.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
