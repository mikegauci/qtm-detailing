"use client";

import type { RefObject } from "react";

type HiddenImageFileInputProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (files: FileList) => void;
  multiple?: boolean;
};

export function HiddenImageFileInput({
  inputRef,
  onSelect,
  multiple = false,
}: HiddenImageFileInputProps) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple={multiple}
      className="hidden"
      onChange={(e) => {
        const files = e.target.files;
        if (files && files.length > 0) onSelect(files);
        e.target.value = "";
      }}
    />
  );
}
