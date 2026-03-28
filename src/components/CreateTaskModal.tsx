"use client";

import { useEffect, useRef, useState } from "react";
import FolderPicker from "./FolderPicker";
import { Button } from "./ui";
import { Input, Textarea } from "./ui/Input";

interface CreateTaskModalProps {
	projects: string[];
	onClose: () => void;
	onCreate: (title: string, description: string, folder: string) => void;
}

function folderLabel(path: string): string {
	return path.split("/").filter(Boolean).pop() || path;
}

export default function CreateTaskModal({ projects, onClose, onCreate }: CreateTaskModalProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [folder, setFolder] = useState(projects[0] || "");
	const [showDropdown, setShowDropdown] = useState(false);
	const [showPicker, setShowPicker] = useState(projects.length === 0);
	const modalRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!showPicker) {
			titleRef.current?.focus();
		}
	}, [showPicker]);

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				if (showPicker && projects.length > 0) {
					setShowPicker(false);
				} else {
					onClose();
				}
			}
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
	}, [onClose, showPicker, projects.length]);

	useEffect(() => {
		function handleClickOutsideDropdown(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setShowDropdown(false);
			}
		}
		if (showDropdown) {
			document.addEventListener("mousedown", handleClickOutsideDropdown);
			return () => document.removeEventListener("mousedown", handleClickOutsideDropdown);
		}
	}, [showDropdown]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!title.trim() || !folder.trim()) return;
		onCreate(title, description, folder);
	}

	function handleFolderSelected(path: string) {
		setFolder(path);
		setShowPicker(false);
	}

	function selectProject(path: string) {
		setFolder(path);
		setShowDropdown(false);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/30" />
			<div
				ref={modalRef}
				className="relative bg-surface rounded-lg shadow-xl w-[480px] max-w-full p-5"
			>
				<h2 className="text-heading font-semibold text-text-primary mb-4">Create Task</h2>
				<form onSubmit={handleSubmit} className="space-y-3">
					<Input
						ref={titleRef}
						id="new-title"
						label="Title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Enter a title..."
					/>

					<div>
						<label className="block text-body font-medium text-text-primary mb-1">Project</label>
						{showPicker ? (
							<FolderPicker
								onSelect={handleFolderSelected}
								onCancel={() => {
									if (projects.length > 0) setShowPicker(false);
								}}
							/>
						) : (
							<div ref={dropdownRef} className="relative">
								<button
									type="button"
									onClick={() => setShowDropdown(!showDropdown)}
									className="w-full px-3 py-2 border border-border-strong rounded-md text-body text-left flex items-center justify-between hover:border-text-disabled focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
								>
									<span className={folder ? "text-text-primary" : "text-text-disabled"}>
										{folder ? folderLabel(folder) : "Select a project..."}
									</span>
									<svg
										className="w-4 h-4 text-text-disabled"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								{folder && (
									<div
										className="text-caption text-text-disabled mt-1 truncate font-mono"
										title={folder}
									>
										{folder}
									</div>
								)}
								{showDropdown && (
									<div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
										{projects.map((p) => (
											<button
												key={p}
												type="button"
												onClick={() => selectProject(p)}
												className="w-full px-3 py-2 text-body text-left hover:bg-primary-light flex flex-col cursor-pointer"
											>
												<span className="font-medium text-text-primary">{folderLabel(p)}</span>
												<span className="text-caption text-text-disabled truncate font-mono">
													{p}
												</span>
											</button>
										))}
										<button
											type="button"
											onClick={() => {
												setShowDropdown(false);
												setShowPicker(true);
											}}
											className="w-full px-3 py-2 text-body text-left hover:bg-primary-light text-primary font-medium border-t border-border cursor-pointer"
										>
											+ Browse for folder...
										</button>
									</div>
								)}
							</div>
						)}
					</div>

					<Textarea
						id="new-desc"
						label="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Add a description..."
						rows={3}
					/>
					<div className="flex justify-end gap-2 pt-2">
						<Button variant="secondary" type="button" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={!title.trim() || !folder.trim()}>
							Create
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
