import type { ButtonHTMLAttributes } from "react";

const variants = {
	ghost: "text-text-disabled hover:text-text-secondary",
	success: "text-success hover:bg-success-light hover:text-success-hover",
} as const;

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: keyof typeof variants;
};

export default function IconButton({
	variant = "ghost",
	className = "",
	children,
	...props
}: IconButtonProps) {
	return (
		<button
			className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors cursor-pointer ${variants[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
