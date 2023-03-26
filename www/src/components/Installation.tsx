"use client";
import { Check,Copy } from "lucide-react";
import * as React from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { Button } from "../components/Button";

export default function Installation() {
  const installScript = "npm install use-selectify";
  const [copied, setCopied] = React.useState(false);

  return (
    <div
      data-exclude
      className="flex select-text items-center justify-between space-x-8 rounded-xl bg-neutral-800/50 py-2 pl-6 pr-1 shadow"
    >
      <span className="mr-4 text-slate-900 dark:text-slate-50">
        {installScript}
      </span>
      <CopyToClipboard text={installScript} onCopy={() => setCopied(true)}>
        <Button variant="subtle" size="sm">
          {copied ? (
            <Check className="h-5 w-5" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </Button>
      </CopyToClipboard>
    </div>
  );
}
