import * as React from "react";
import Link from "next/link";
import type { LinkRestProps } from "next/link";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center rounded-md text-sm focus:ring-offset-slate-900 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=open]:text-slate-50 data-[state=open]:bg-slate-800",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 hover:bg-neutral-800 hover:text-slate-50 dark:hover:bg-neutral-800 dark:hover:text-slate-50",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-600",
        outline: "bg-transparent border border-slate-200 hover:bg-slate-50",
        subtle: "bg-neutral-800 text-slate-50 hover:bg-neutral-700",
        ghost:
          "bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 dark:text-slate-50 dark:hover:text-slate-50 dark:data-[state=open]:text-slate-900 data-[state=open]:bg-neutral-900 dark:data-[state=open]:bg-white",
        link: "bg-transparent dark:bg-transparent underline-offset-4 hover:underline text-slate-900 dark:text-slate-50 hover:bg-transparent dark:hover:bg-transparent",
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
  React.AnchorHTMLAttributes<HTMLAnchorElement> &
  React.RefAttributes<HTMLAnchorElement>) & {
  href?: string;
};
type ButtonArgs = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.RefAttributes<HTMLButtonElement>;
type ConditionalRestArgs = LinkArgs & ButtonArgs;

interface IButtonProps extends Omit<ConditionalRestArgs, "href"> {
  // make 'href' optional
  href?: string;
}

export interface ButtonProps
  extends IButtonProps,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    { href, disabled, className, variant, size, ...props }: ButtonProps,
    ref
  ) => {
    const classes = cn(buttonVariants({ variant, size, className }));
    return href && !disabled ? (
      <Link href={href} className={classes} ref={ref} {...props} />
    ) : (
      <button
        className={classes}
        disabled={disabled}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
