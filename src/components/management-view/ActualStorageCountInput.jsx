import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export default function ActualStorageCountInput({ value, onSave }) {
  const [draftValue, setDraftValue] = useState(value ?? "");

  useEffect(() => {
    setDraftValue(value ?? "");
  }, [value]);

  const handleSave = () => {
    if (draftValue === "" || Number(draftValue) === Number(value ?? "")) return;
    onSave(draftValue);
  };

  return (
    <Input
      type="number"
      min="0"
      value={draftValue}
      onChange={(e) => setDraftValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className="h-8 w-20 mx-auto text-center bg-white"
    />
  );
}