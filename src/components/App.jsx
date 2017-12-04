import { connect } from 'react-redux';
import AppComponent from './AppComponent.jsx';
import { setUserTokenLoading, unsetUserTokenLoading, setUserToken, setTokenFetchComplete, setCredentialsFetchComplete, setSlugsFetchComplete, setCardSlugs, setSlugsLoading, unsetSlugsLoading, setAppLoading, unsetAppLoading, clearUser, setSearchFacet, setSearchQuery, showSnackbar, selectFeed, unselectFeed, selectFacet, setNewUserInstructionsState, setPyramidStyles } from '../redux.js';
import { withRouter } from 'react-router-dom';

const mapStateToProps = (state, ownProps) => {
	return {
		fetchComplete: state.reducer.fetchComplete,
		loading: state.reducer.loading,
		cardStack: state.reducer.cardStack,
		navbar: state.reducer.navbar,
		slugs: state.reducer.slugs,
		user: state.reducer.user,
		notification: state.reducer.notification,
		router: state.router,
		feeds: state.reducer.feeds,
		feed: state.reducer.feed,
		card: state.reducer.card,
		snackbar: state.reducer.snackbar,
		discourse: state.reducer.discourse,
		instructions: state.reducer.instructions,
		pyramid: state.reducer.pyramid
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		setUserTokenLoading: () => {
			return dispatch(setUserTokenLoading());
		},
		unsetUserTokenLoading: () => {
			return dispatch(unsetUserTokenLoading());
		},
		setUserToken: (token) => {
			return dispatch(setUserToken(token));
		},
		setTokenFetchComplete: () => {
			return dispatch(setTokenFetchComplete());
		},
		setCredentialsFetchComplete: () => {
			return dispatch(setCredentialsFetchComplete());
		},
		setSlugsFetchComplete: () => {
			return dispatch(setSlugsFetchComplete());
		},
		setCardSlugs: (slugsHash) => {
			return dispatch(setCardSlugs(slugsHash));
		},
		setSlugsLoading: () => {
			return dispatch(setSlugsLoading());
		},
		unsetSlugsLoading: () => {
			return dispatch(unsetSlugsLoading());
		},
		setAppLoading: () => {
			return dispatch(setAppLoading());
		},
		unsetAppLoading: () => {
			return dispatch(unsetAppLoading());
		},
		clearUser: () => {
			return dispatch(clearUser());
		},
		setSearchFacet: (facetCategory, facetSubCategory, facets) => {
			return dispatch(setSearchFacet(facetCategory, facetSubCategory, facets));
		},
		setSearchQuery: (query) => {
			return dispatch(setSearchQuery(query));
		},
		showSnackbar: (message, duration) => {
			return dispatch(showSnackbar(message, duration));
		},
		selectFeed: (level) => {
			return dispatch(selectFeed(level));
		},
		unselectFeed: () => {
			return dispatch(unselectFeed());
		},
		selectFacet: () => {
			return dispatch(selectFacet());
		},
		setNewUserInstructionsState: (instructions) => {
			return dispatch(setNewUserInstructionsState(instructions));
		},
		setPyramidStyles: (styles) => {
			return dispatch(setPyramidStyles(styles));
		}
	}
};

const App = connect(
	mapStateToProps,
	mapDispatchToProps
)(AppComponent);

export default withRouter(App);
