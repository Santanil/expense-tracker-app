"use client";

import { FormEvent, useRef, useState } from "react";
import { ASSET_STATUSES, ASSET_TYPES, AssetStatus, AssetType, NewAsset } from "@/lib/assets";
import Select from "./Select";
import SlideToConfirm, { SlideToConfirmHandle } from "./SlideToConfirm";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_VALUES: NewAsset = {
  asset_name: "",
  asset_type: ASSET_TYPES[0],
  status: "Active",
  start_date: todayISO(),
  end_date: "",
  account_number: "",
  amount_invested: 0,
  amount_expected_maturity: ""
};

export default function AssetForm({
  initial,
  submitLabel = "Save",
  useSlider = false,
  sliderLabel = "Slide to log",
  onSubmit,
  onCancel
}: {
  initial?: NewAsset;
  submitLabel?: string;
  useSlider?: boolean;
  sliderLabel?: string;
  onSubmit: (input: NewAsset) => Promise<void>;
  onCancel?: () => void;
}) {
  const start = initial ?? DEFAULT_VALUES;
  const [assetName, setAssetName] = useState(start.asset_name);
  const [assetType, setAssetType] = useState<AssetType>(start.asset_type);
  const [status, setStatus] = useState<AssetStatus>(start.status);
  const [startDate, setStartDate] = useState(start.start_date);
  const [endDate, setEndDate] = useState(start.end_date);
  const [accountNumber, setAccountNumber] = useState(start.account_number);
  const [amountInvested, setAmountInvested] = useState(
    start.amount_invested ? String(start.amount_invested) : ""
  );
  const [amountExpectedMaturity, setAmountExpectedMaturity] = useState(
    start.amount_expected_maturity
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const sliderRef = useRef<SlideToConfirmHandle>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numericInvested = Number(amountInvested);
    const numericExpectedMaturity = Number(amountExpectedMaturity);
    if (!assetName.trim()) {
      setError("Enter an asset name.");
      sliderRef.current?.reset();
      return;
    }
    if (!numericInvested || numericInvested <= 0) {
      setError("Enter an amount invested greater than zero.");
      sliderRef.current?.reset();
      return;
    }
    if (!amountExpectedMaturity || !numericExpectedMaturity || numericExpectedMaturity <= 0) {
      setError("Enter an amount expected at maturity greater than zero.");
      sliderRef.current?.reset();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        asset_name: assetName,
        asset_type: assetType,
        status,
        start_date: startDate,
        end_date: endDate,
        account_number: accountNumber,
        amount_invested: numericInvested,
        amount_expected_maturity: amountExpectedMaturity
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save asset.");
      sliderRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <label className="block">
        <span className="font-body text-xs text-ink/60">Asset name</span>
        <input
          type="text"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
          placeholder="e.g. HDFC FD 2026"
          className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <div className="block">
          <span className="font-body text-xs text-ink/60">Type</span>
          <Select
            value={assetType}
            onChange={setAssetType}
            options={ASSET_TYPES.map((t) => ({ value: t, label: t }))}
            ariaLabel="Type"
          />
        </div>

        <div className="block">
          <span className="font-body text-xs text-ink/60">Status</span>
          <Select
            value={status}
            onChange={setStatus}
            options={ASSET_STATUSES.map((s) => ({ value: s, label: s }))}
            ariaLabel="Status"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="font-body text-xs text-ink/60">Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
          />
        </label>

        <label className="block">
          <span className="font-body text-xs text-ink/60">End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
          />
        </label>
      </div>

      <label className="block">
        <span className="font-body text-xs text-ink/60">Account / folio number</span>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Optional"
          className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="font-body text-xs text-ink/60">Amount invested</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amountInvested}
            onChange={(e) => setAmountInvested(e.target.value)}
            placeholder="0"
            className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
          />
        </label>

        <label className="block">
          <span className="font-body text-xs text-ink/60">Expected at maturity</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amountExpectedMaturity}
            onChange={(e) => setAmountExpectedMaturity(e.target.value)}
            placeholder="0"
            className="mt-1 w-full border-b border-line bg-transparent py-2 font-body text-base text-ink outline-none transition focus:border-ledger"
          />
        </label>
      </div>

      {error && <p className="font-body text-sm text-rust">{error}</p>}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-line py-3 font-body text-sm text-ink/60 transition hover:text-ink"
          >
            Cancel
          </button>
        )}
        {useSlider ? (
          <div className="mx-auto w-4/5">
            <SlideToConfirm
              ref={sliderRef}
              label={sliderLabel}
              disabled={submitting}
              onConfirm={() => formRef.current?.requestSubmit()}
            />
          </div>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="btn-glow flex-1 bg-ink py-3 font-body text-sm text-paper transition hover:bg-ledger disabled:opacity-60"
          >
            {submitting ? "Saving…" : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}
