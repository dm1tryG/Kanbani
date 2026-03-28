"use client";

import { useEffect, useRef, useState } from "react";
import FolderPicker from "./FolderPicker";
import { Button } from "./ui";
import { Input, Textarea } from "./ui/Input";

interface CreateTaskModalProps {
	projects: string[];
	defaultProject?: string | null;
	onClose: () => void;
	onCreate: (title: string, description: string, folder: string) => void;
}

function folderLabel(path: string): string {
	return path.split("/").filter(Boolean).pop() || path;
}

export default function CreateTaskModal({ projects, defaultProject, onClose, onCreate }: CreateTaskModalProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [folder, setFolder] = useState(defaultProject || projects[0] || "");
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
			<div className="absolute inset-0 bg-overlay animate-fade-in" />
			<div
				ref={modalRef}
				className="relative bg-surface rounded-xl shadow-modal w-[500px] max-w-full p-6 animate-scale-in"
			>
				<h2 className="text-heading font-bold text-foreground mb-5">Create Task</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
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
						<label className="block text-body font-semibold text-foreground mb-1.5">Project</label>
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
									className="w-full px-3 py-2.5 bg-surface border border-border-strong rounded-md text-body text-left flex items-center justify-between hover:border-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer transition-colors"
								>
									<span className={folder ? "text-foreground" : "text-faint"}>
										{folder ? folderLabel(folder) : "Select a project..."}
									</span>
									<svg
										className="w-4 h-4 text-faint"
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
									<div className="text-caption text-faint mt-1.5 truncate font-mono" title={folder}>
										{folder}
									</div>
								)}
								{showDropdown && (
									<div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-lg shadow-dropdown max-h-48 overflow-y-auto animate-scale-in">
										{projects.map((p) => (
											<button
												key={p}
												type="button"
												onClick={() => selectProject(p)}
												className="w-full px-3 py-2.5 text-body text-left hover:bg-primary-light flex flex-col cursor-pointer transition-colors"
											>
												<span className="font-semibold text-foreground">{folderLabel(p)}</span>
												<span className="text-caption text-faint truncate font-mono">{p}</span>
											</button>
										))}
										<button
											type="button"
											onClick={() => {
												setShowDropdown(false);
												setShowPicker(true);
											}}
											className="w-full px-3 py-2.5 text-body text-left hover:bg-primary-light text-primary font-semibold border-t border-border cursor-pointer transition-colors"
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
					<div className="flex justify-end gap-2.5 pt-3">
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
