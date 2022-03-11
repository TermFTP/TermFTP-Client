import { TERMINAL_CLASS_NAME } from "@components";
import { Group } from "@models";
import { ProgressFileI } from "@shared";
import { readdirSync, statSync } from "fs";
import { basename } from "path";

export function getNumOfItems(group: Group): number {
	let sum = 0;
	for (const g of group?.serverGroups || []) {
		// eslint-disable-next-line
		sum += g.server.length;
		sum += getNumOfItems(g) + 1;
	}
	return sum;
}

/**
 * normalises a string by adding a leading slash (if necessary) and removing a trailing slash (if necessary)
 *
 * example: url/ -> /url
* @param url the url to be normalised
 * @returns a normalised url with a slash at the beginning and none at the end
 */
export function normalizeURL(url: string): string {
	url = decodeURI(url);
	if (url.endsWith("/")) {
		url = url.substring(0, url.length - 1);
	}
	if (!url.startsWith("/")) {
		url = "/" + url;
	}
	return url;
}

export function getProgressDir(cwd: string, dir: string): ProgressFileI[] {
	let results: ProgressFileI[] = [];
	const list = readdirSync(dir);
	list.forEach(function (file) {
		file = dir + "/" + file;
		const stat = statSync(file);
		if (stat && stat.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(getProgressDir(cwd + basename(dir) + "/", file));
		} else {
			/* Is a file */
			results.push({
				cwd: cwd + basename(dir) + "/",
				name: basename(file),
				progress: 0,
				progressType: "upload",
				total: stat.size,
			});
		}
	})
	return results;
}

export const checkTag = (el: HTMLElement, tag: string): boolean => el?.tagName.toLowerCase() === tag.toLowerCase()

/**
 * checks if an element is an input-like element. Example:
 * 	`input` element
 * 	`contentEditable` attribute is set to true
 * 	it's a child of the terminal element
 * @param el the element to be checked
 * @returns true if the element is an input (or similiar)
 */
export const checkIfInInput = (el: HTMLElement): boolean => checkTag(el, "input") || el.isContentEditable || Boolean(el.closest(`.${TERMINAL_CLASS_NAME}`));