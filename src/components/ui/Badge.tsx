import type { HTMLAttributes } from "react";

const variants = {
	default: "bg-primary-light text-primary",
	agent: "bg-accent-light text-accent",
	warning: "bg-warning-light text-warning animate-pulse",
	neutral: "bg-surface-dim text-muted",
	count: "bg-surface-dim text-faint",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
	variant?: keyof typeof variants;
};

export default function Badge({
	variant = "default",
	className = "",
	children,
	...props
}: BadgeProps) {
	return (
		<span
			className={`inline-block text-caption font-semibold px-2 py-0.5 rounded-md ${variants[variant]} ${className}`}
			{...props}
		>
			{children}
		</span>
	);
}
