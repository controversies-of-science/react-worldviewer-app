// React Dependencies
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// UI Dependencies
import './Home.css';
import elephant from '../../images/elephant.png';
import { Grid } from 'react-bootstrap';
import AspectRatio from 'react-aspect-ratio';
import 'react-aspect-ratio/aspect-ratio.css';
import FadeIn from 'react-fade-in';
import InfiniteScroll from 'react-infinite-scroll-component';

// mobiscroll.Image + mobiscroll.Form + 
import mobiscroll from '../../libs/mobiscroll.custom-3.2.5.min';
import '../../libs/mobiscroll.custom-3.2.5.min.css';

// Algolia Search / React Router Integration Dependencies
import { InstantSearch, SearchBox, Stats, Configure } from 'react-instantsearch/dom';
import SearchResult from '../SearchResult/SearchResult';
import qs from 'qs';
import { withRouter } from 'react-router-dom';
import { createConnector } from "react-instantsearch";
import { connectInfiniteHits } from 'react-instantsearch/connectors';

// Config
import config from '../../config';

// Error/Logger Handling
import { log, logTitle } from '../../libs/utils';

// Permits HTML markup encoding in feed text
// import { Parser as HtmlToReactParser } from 'html-to-react';

// React Router / Algolia Search integration
const
	updateAfter = 700,
	createURL = state => `?${qs.stringify(state)}`,
	searchStateToUrl = (props, searchState) =>
		searchState ? `${props.location.pathname}${createURL(searchState)}` : '';

const imageStyles = {
	display: 'block',
	margin: '0 auto',
	maxWidth: '480px',
	top: '50px',
	width: '100%'
};

// This prevents a reflow on page render, whereby image loads after the search box,
// https://github.com/roderickhsiao/react-aspect-ratio
const RatioImage = (props) => (
	<AspectRatio ratio="480/302" style={imageStyles}>
		<img
			alt="blind men and the elephant logo"
			src={elephant}
			className="Logo"
			onClick={props.clickHandler} />

	</AspectRatio>
);

class HomeComponent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			searchState: qs.parse(props.location.search.slice(1)),
			facetCategory: '',
			facetSubCategory: ''
		};

		this.props = props;
	}

	refreshForm() {
		if (this.refs.form !== undefined) {
			this.refs.form.instance.refresh();
		}
	}

	// Let's make it so that clicking the elephant triggers the facet selection.
	// The original input label is hidden.
	selectFacet() {
		const domNode = ReactDOM.findDOMNode(this.inputElement);
		domNode.click();
	}

	setFacetValue(selection) {
		if (selection.valueText) {
			let facetCategory = '',
				facetSubCategory = '';

			if (selection.valueText.match(': ')) {
				[facetCategory, facetSubCategory] = selection.valueText.split(': ');
			} else {
				facetCategory = selection.valueText === 'All' ?
					'' :
					selection.valueText;
			}

			this.setState({
				facetCategory,
				facetSubCategory
			});	

			logTitle('Setting New Facet Values:');
			log('facetCategory: ' + facetCategory);
			log('facetSubCategory: ' + facetSubCategory);
			log('');		
		}
	}

	// This and the other InstantSearch / React Router integration code comes from
	// https://github.com/algolia/react-instantsearch/blob/master/packages
	// /react-instantsearch/examples/react-router/src/App.js 
	onSearchStateChange = searchState => {
		clearTimeout(this.debouncedSetState);
		this.debouncedSetState = setTimeout(() => {

			// This was not in the supplied code, but it is necessary in order to
			// clear out the search query parameter when there is no active search
			if (!searchState.query) {
				searchState = {};
			}

			this.props.history.push(
				searchStateToUrl(this.props, searchState),
				searchState
			);
		}, updateAfter);

		this.setState({ searchState });
	};

	async componentDidMount() {
		// To prevent flash of unstyled content
		document.getElementById('fouc').style.display = 'block';

		// This is necessary because the autoFocus={true} prop which is supposedly on
		// the SearchBox component apparently does nothing
		const searchBoxDOMNode = ReactDOM.findDOMNode(this.textInput).querySelector('input');
		searchBoxDOMNode.focus();
	}

	render() {
		// Do not do this: It's way too slow ...
		// const isSearch = this.props.router.location && this.props.router.location.search ? 
		// 	this.props.router.location.state.query !== '' :
		// 	false;

		const categoryText = this.state.facetCategory +
			(this.state.facetSubCategory ?
				': ' + this.state.facetSubCategory :
				'');

		let facetArray;

		if (this.state.facetCategory === 'Cards/Feeds') {
			facetArray = [[`facetCategory:Controversy Cards`, `facetCategory:Feeds`],
				`facetSubCategory:${this.state.facetSubCategory}`];

		// TODO: Create a type field which I can use to select just card and feed titles
		// when there is no search query.

		// } else if (this.state.facetCategory === 'Cards/Feeds' &&
		// 	!this.state.searchState.query) {
		// 	facetArray = [[`facetCategory:Controversy Cards`, `facetCategory:Feeds`],
		// 		`facetSubCategory:${this.state.facetSubCategory}`];

		} else if (this.state.facetSubCategory) {
			if (this.state.facetSubCategory.match(' / ')) {
				const subCategories = this.state.facetSubCategory.split(' / ');

				facetArray = [`facetCategory:${this.state.facetCategory}`];
				let facetORArray = [];

				subCategories.forEach(sub => {
					facetORArray.push(`facetSubCategory:${sub}`);
				});

				facetArray.push(facetORArray);

			} else {
				facetArray = [`facetCategory:${this.state.facetCategory}`,
					`facetSubCategory:${this.state.facetSubCategory}`];
			}
		} else {
			facetArray = [`facetCategory:${this.state.facetCategory}`];			
		}

		return (
			<div className="Home" id="fouc">

				<FadeIn>
					<RatioImage
						clickHandler={this.selectFacet.bind(this)} />

					<div className="FacetSelect">
					<mobiscroll.Image
						ref={input => this.inputElement = input}
						theme="ios-dark"
						display="center"
						enhance={true}
						onInit={this.refreshForm.bind(this)}
						onSet={this.setFacetValue.bind(this)}>

						{ config.categories.map((category, i) =>
							<li data-val={category.text} key={i}>
								{/* <img src={category.icon} /> */}
								<p>{category.text}</p>
							</li>) }

					</mobiscroll.Image>
					</div>

					<InstantSearch
						appId="HDX7ZDMWE9"
						apiKey="f9898dbf6ec456d206e59bcbc604419d"
						indexName="controversy-cards"
						searchState={this.state.searchState}
						onSearchStateChange={this.onSearchStateChange.bind(this)}
						createURL={createURL}>

						<Configure facetFilters={facetArray} />

						<Grid>
							<SearchBox
								ref={ input => { this.textInput = input } }
								className="SearchBox"
								focusShortcuts={[' ']}
								translations={{placeholder: 'Enter a Controversy'}} />

							{ this.state.searchState.hits && this.state.searchState.hits.length > 0 ?
								<p className='CategoryLabel'>Searching {categoryText || 'All'}</p> :
								null }
						</Grid>

						<ConditionalHits
							facetCategory={this.state.facetCategory}
							facetSubCategory={this.state.facetSubCategory} />

					</InstantSearch>
				</FadeIn>

			</div>
		);
	}
}

// https://github.com/algolia/react-instantsearch/blob/master/docgen/src/examples/e-commerce-infinite/App.js
function CustomHits({ hits, refine, hasMore }) {
	return (
		<main id="hits">
			<InfiniteScroll next={refine} hasMore={hasMore}>
				{hits.map(hit => <SearchResult hit={hit} key={hit.objectID} />)}
			</InfiniteScroll>
		</main>
	);
}

// Only displays search results when there is a query
// https://community.algolia.com/react-instantsearch/guide/Custom_connectors.html
const ConditionalHits = createConnector({
	displayName: "ConditionalQuery",
	getProvidedProps(props, searchState, searchResults, searchForFacetValuesResults) {
		const {query, hits} = searchResults.results ? searchResults.results : {};

		// logTitle('searchResults:');
		// log(searchResults);
		// log('');

		// logTitle('searchForFacetValuesResults:');
		// log(searchForFacetValuesResults);
		// log('');

		// logTitle('searchState:');
		// log(searchState);
		// log('');

		return { query, hits, props };
	}

})(({ query, hits, props }) => {

	// logTitle('props:');
	// log(props.facetCategory);
	// log(props.facetSubCategory);
	// log('');

	const hs =
		(hits && query && props.facetCategory === '' && props.facetSubCategory === '') ||
		(hits && (props.facetCategory !== '' || props.facetSubCategory !== '')) ?

		(<div id="hits">
			<Grid>

				<Stats />
				<ConnectedHits />

			</Grid>

		</div>)
		: null;

	return (
		<div id="hits">
			{hs}
		</div>);
});

const ConnectedHits = connectInfiniteHits(CustomHits);

export default withRouter(HomeComponent);
