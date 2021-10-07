import { FuzzySegment, prepareSearch, parseValue, scoreValue } from './search';
import { primates, Primate } from './primates';

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

interface FilterMatch {
	score: number;
	value: Primate;
	segments: FuzzySegment[];
}

export const filter = (
	filter: string,
	scoreOffset = -9007199254740991,
	scoreLimit = 9007199254740991,
	listLimit = 20,
	listOffset = 0,
) => {
	return (
		primates
			// First, we want to take the updated form input and use it to SCORE the
			// collection of values. This phase will have to evaluate the entire set of
			// values; but, will only do the minimal amount of work needed to calculate a
			// scope. Then, we'll be able to use that score to narrow down and format the
			// set of values that we end-up showing to the user.
			.map(primate => {
				return {
					value: primate,
					score: scoreValue(
						prepareSearch(primate, [
							'name',
							'category',
							'keywords',
						]),
						filter,
					),
				};
			})

			// Filteration based on score threshold
			.filter((m) =>
				m.score <= scoreLimit && m.score > scoreOffset
			)
			// Now that the entire set of values has been scored, let's sort them from
			// highest to lowest.

			.sort((a, b) => {
				return (
					(a.score > b.score && -1) || // Move item up.
					(a.score < b.score && 1) || // Move item down.
					0
				);
			})
			// For the sake of the demo, we only want to show the top-scoring matches.
			// Slice off the top of the scored values.
			.slice(listOffset, listLimit)
			// At this point, we've narrowed down the set of values to the ones we want
			// to show to the user. Now, we can go back and create a data-structure that
			// can be more easily rendered (but takes more processing).
			.map(scoredValue => {
				const match: FilterMatch = {
					score: scoredValue.score,
					value: scoredValue.value,
					segments: parseValue(prepareSearch(scoredValue.value, [
						'name',
						'category',
						'keywords',
					]), filter),
				};
				return match;
			})
	);
};
