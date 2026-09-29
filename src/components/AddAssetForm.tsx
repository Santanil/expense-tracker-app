"use client";

import { useState } from "react";
import { NewAsset } from "@/lib/assets";
import AssetForm from "./AssetForm";

export default function AddAssetForm({
  onAdd
}: {
  onAdd: (input: NewAsset) => Promise<void>;
}) {
  // No collapse/expand toggle, no Cancel button — this form stays
  // expanded on Total Asset always. `resetKey` remounts the form (fresh
  // default fields) after each save, since there's no "closed" state to
  // return to.
  const [resetKey, setResetKey] = useState(0);

  return (
    <AssetForm
      key={resetKey}
      useSlider
      sliderLabel="Slide to log"
      onSubmit={async (input) => {
        await onAdd(input);
        setResetKey((k) => k + 1);
      }}
    />
  );
}
