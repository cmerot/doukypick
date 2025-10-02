export interface GoogleReview {
	authorAttribution: {
		displayName: string;
		uri: string;
		photoUri: string;
	};
	rating: number;
	text: {
		text: string;
		languageCode: string;
	};
	originalText: {
		text: string;
		languageCode: string;
	};
	relativePublishTimeDescription: string;
	publishTime: string;
}

export interface GooglePlacesResponse {
	reviews?: GoogleReview[];
	rating?: number;
	userRatingCount?: number;
}

export interface ReviewsData {
	reviews: GoogleReview[];
	rating: number;
	totalReviews: number;
}
