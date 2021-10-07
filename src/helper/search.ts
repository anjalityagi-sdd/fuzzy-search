
export type FuzzyScore = number;

export interface FuzzySegment {
	value: string;
	isMatch: boolean;
}

const prepareSearch = <T extends Record<string, any>>(
	item: T,
	keys: Array<keyof T>,
	sep = ' ',
) => {
	return keys
		.map(n => (Array.isArray(item[n]) ? item[n].join(sep) : item[n]))
		.join(sep);
};


const levenshteinDistance = (str1 = '', str2 = '') => {
	const track = Array(str2.length + 1).fill(null).map(() =>
		Array(str1.length + 1).fill(null));
	for (let i = 0; i <= str1.length; i += 1) {
		track[0][i] = i;
	}
	for (let j = 0; j <= str2.length; j += 1) {
		track[j][0] = j;
	}
	for (let j = 1; j <= str2.length; j += 1) {
		for (let i = 1; i <= str1.length; i += 1) {
			const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
			track[j][i] = Math.min(
				track[j][i - 1] + 1, // deletion
				track[j - 1][i] + 1, // insertion
				track[j - 1][i - 1] + indicator, // substitution
			);
		}
	}
	return track[str2.length][str1.length];
};

// I parse the value against the given input, dividing it up into a collection of
// segments that either match or do not match sequences within the input.
const parseValue: (value: string, input: string) => FuzzySegment[] = (
	value,
	input,
) => {
	const valueLength = value.length;
	const inputLength = input.length;
	let valueIndex = 0;
	let inputIndex = 0;

	const segments: FuzzySegment[] = [];
	let segment: FuzzySegment | undefined;

	while (valueIndex < valueLength) {
		const valueChar = value.charAt(valueIndex++).toLowerCase();
		const inputChar = input.charAt(inputIndex).toLowerCase();

		// If this character matches the input, add to a matching segment.
		if (valueChar === inputChar) {
			inputIndex++;

			if (segment && segment.isMatch) {
				segment.value += valueChar;
			} else {
				segment = {
					value: valueChar,
					isMatch: true,
				};
				segments.push(segment);
			}

			// If we've run out of input characters to match, we can short-circuit
			// the segmentation - we know that the rest of the value will contain
			// non-matching characters - we can add them to a final segment.
			if (inputIndex === inputLength && valueIndex < valueLength) {
				segments.push({
					value: value.slice(valueIndex),
					isMatch: false,
				});

				// Force the while-loop to end.
				break;
			}

			// If this character does NOT match the input, add to a non-matching segment.
		} else {
			if (segment && !segment.isMatch) {
				segment.value += valueChar;
			} else {
				segment = {
					value: valueChar,
					isMatch: false,
				};
				segments.push(segment);
			}
		}
	}

	return segments;
};

// I compare the input to the given value and return a score for the fuzzy match.
const scoreValue: (value: string, input: string) => FuzzyScore = (
	value,
	input,
) => {
	// For the scoring process, we don't need to maintain the case of the arguments.
	// As such, we can normalize them now so that we don't have to do it inside of
	// each loop iteration.
	const normalizedValue = value.toLowerCase();
	const normalizedInput = input.toLowerCase();

	const valueLength = normalizedValue.length;
	const inputLength = normalizedInput.length;
	let valueIndex = 0;
	let inputIndex = 0;

	// When several letters are matched in a row, we're going to give them extra
	// weight in the scoring since this more likely to provide a meaningful match.
	let previousIndexMatched = false;
	let score = 0;
	const distance = levenshteinDistance(normalizedValue, normalizedInput);
	score = 1000 / distance;
	while (valueIndex < valueLength) {
		const valueChar = normalizedValue.charAt(valueIndex++); // Get and increment.
		const inputChar = normalizedInput.charAt(inputIndex);

		// If the current character matches the next part of the sequential input,
		// we are going to increase the score of the match.
		if (valueChar === inputChar) {
			inputIndex++;

			// If the previous character was also a match, let's bump the score by
			// slightly more.
			score += previousIndexMatched ? 30 : 2;

			previousIndexMatched = true;

			// If we've run out of input characters to match, then we can short-
			// circuit the scoring based on the number of remaining characters in the
			// value (each remaining character will be detracted from the score).
			if (inputIndex === inputLength) {
				return (score -= valueLength - valueIndex);
			}

			// If the current character does NOT Match the next part of the sequential
			// input, we are going to decrease the score of the match.
		} else {
			score -= 1;
			previousIndexMatched = false;
		}
	}

	return score;
};

export { prepareSearch, parseValue, scoreValue };
