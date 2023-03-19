import * as React from "react";
import Link from "next/link";
import type { LinkRestProps } from "next/link";

import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center rounded-md text-sm hover:bg-slate-800 hover:text-slate-100 focus:ring-offset-slate-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:text-slate-100 data-[state=open]:bg-slate-800",
  {
    variants: {
      variant: {
        default: "text-white bg-slate-50 text-slate-900 dark:text-black",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "bg-transparent border border-slate-200 hover:bg-slate-100",
        subtle: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost:
          "bg-transparent hover:bg-slate-100 dark:hover:bg-neutral-800 dark:text-slate-100 dark:hover:text-slate-100 dark:data-[state=open]:text-slate-900 data-[state=open]:bg-neutral-900 dark:data-[state=open]:bg-white",
        link: "bg-transparent dark:bg-transparent underline-offset-4 hover:underline text-slate-900 dark:text-slate-100 hover:bg-transparent dark:hover:bg-transparent",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-2 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Can either be a Link component or a native button with full typing for each case
 */
type LinkArgs = (LinkRestProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement>) & {
  href?: string;
};
type ButtonArgs = React.ButtonHTMLAttributes<HTMLButtonElement>;
type ConditionalRestArgs = LinkArgs & ButtonArgs;
interface IButtonProps extends Omit<ConditionalRestArgs, "href"> {
  // make 'href' optional
  href?: string;
}

export interface ButtonProps
  extends IButtonProps,
    VariantProps<typeof buttonVariants> {}

const Button = ({
  href,
  disabled,
  className,
  variant,
  size,
  ...props
}: ButtonProps) => {
  const classes = cn(buttonVariants({ variant, size }), className);
  return href && !disabled ? (
    <Link href={href} className={classes} {...props} />
  ) : (
    <button className={classes} disabled={disabled} {...props} />
  );
};

export { Button };
