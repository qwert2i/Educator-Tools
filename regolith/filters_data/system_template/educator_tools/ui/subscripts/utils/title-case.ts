/**
 * Takes a string and capitalizes each letter of a new word.
 * @param str - The input string.
 * @returns The title-cased string.
 */
export function titleCase(str: string): string {
	return str;
	return str
		.toLowerCase()
		.split(" ")
		.map(function (word: string): string {
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
}
