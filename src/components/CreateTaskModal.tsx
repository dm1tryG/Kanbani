"use client";

import { useEffect, useRef, useState } from "react";

interface CreateTaskModalProps {
	onClose: () => void;
	onCreate: (title: string, description: string) => void;
}

export default function CreateTaskModal({ onClose, onCreate }: CreateTaskModalProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const modalRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		titleRef.current?.focus();
	}, []);

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		function handleClickOutside(e: MouseEvent) {
			if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
				onClose();
			}
		}
		document.addEventListener("keydown", handleKey);
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("keydown", handleKey);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onClose]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!title.trim()) return;
		onCreate(title, description);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/30" />
			<div
				ref={modalRef}
				className="relative bg-white rounded-xl shadow-xl w-[420px] max-w-full p-5"
			>
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Create Task</h2>
				<form onSubmit={handleSubmit} className="space-y-3">
					<div>
						<label htmlFor="new-title" className="block text-sm font-medium text-gray-700 mb-1">
							Title
						</label>
						<input
							ref={titleRef}
							id="new-title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter a title..."
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
						/>
					</div>
					<div>
						<label htmlFor="new-desc" className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							id="new-desc"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add a description..."
							rows={4}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
						/>
					</div>
					<div className="flex justify-end gap-2 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
							disabled={!title.trim()}
						>
							Create
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
