import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	ref?: Ref<HTMLInputElement>;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	label?: string;
	ref?: Ref<HTMLTextAreaElement>;
};

const inputClass =
	"w-full px-3 py-2 border border-border-strong rounded-md text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

export function Input({ label, id, className = "", ref, ...props }: InputProps) {
	return (
		<div>
			{label && (
				<label htmlFor={id} className="block text-body font-medium text-text-primary mb-1">
					{label}
				</label>
			)}
			<input ref={ref} id={id} className={`${inputClass} ${className}`} {...props} />
		</div>
	);
}

export function Textarea({ label, id, className = "", ref, ...props }: TextareaProps) {
	return (
		<div>
			{label && (
				<label htmlFor={id} className="block text-body font-medium text-text-primary mb-1">
					{label}
				</label>
			)}
			<textarea ref={ref} id={id} className={`${inputClass} resize-none ${className}`} {...props} />
		</div>
	);
}
