// React Dependencies
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// UI Dependencies
import { Row, Col } from 'react-bootstrap';
import worldview from '../../images/worldview-node.svg';
import model from '../../images/model-node.svg';
import propositional from '../../images/propositional-node.svg';
import conceptual from '../../images/conceptual-node.svg';
import narrative from '../../images/narrative-node.svg';
import quote from '../../images/quote.svg';
import './SearchResult.css';
import notFoundImage from '../../images/error-thumbnail.png';

// React Router Dependencies
import { withRouter } from 'react-router-dom';

// Algolia Search Dependencies
import { connectHighlight } from 'react-instantsearch/connectors';

// HTML-to-React Parser Dependencies
import { Parser as HtmlToReactParser } from 'html-to-react';

// Clipboard Dependencies
// import Clipboard from 'clipboard';

// This is a custom combination of two tools:
// (1) https://www.npmjs.com/package/html-to-react
// (2) https://community.algolia.com/react-instantsearch/connectors/connectHighlight.html 
const CustomHighlight = connectHighlight(
	({ highlight, attributeName, hit, highlightProperty }) => {
		const
			h = new HtmlToReactParser(),

			parsedHit = highlight({ attributeName, hit, highlightProperty:
				'_highlightResult' });

		let highlightedHits = parsedHit.map(part => {
				if (part.isHighlighted) return '<mark>' + part.value + '</mark>';
				return part.value;
			});

		if (attributeName === "quoteParagraph") {
			// We need the actual quoted sections to appear in italics
			highlightedHits = highlightedHits.map(el => el.replace(/^"/m, '<i>"'));
			highlightedHits = highlightedHits.map(el => el.replace(/"$/m, '"</i>'));

			// If it's a quoteParagraph, then replace any carriage return characters with
			// HTML linebreaks.  This is a hack which is necessary because when it is placed
			// further up, the HTML breaks are converted back into carriage returns.
			highlightedHits = highlightedHits.map(el => el.replace(/\n/g, "<br/>"));
		} else {
			// Eliminate all anchor tags in search results
			highlightedHits = highlightedHits.map(el => el.replace(/<a href=.*>/g, ''));
			highlightedHits = highlightedHits.map(el => el.replace(/<\/a>/g, ''));
		}

		const
			reactComponent = highlightedHits.reduce((prev, cur) => prev + cur);

		return <div>{h.parse(reactComponent)}</div>;
	}
);

class SearchResultComponent extends Component {
	constructor(props) {
		super(props);

		this.state = {
			hitHeight: 0,
			// file: null
		};

		this.props = props;

		this.hitHeader = {
			'cardName': 'Card Title',
			'cardSummary': 'Card Summary',
			'postName': 'Post Name',
			'cardParagraph': 'Card Paragraph',
			'postParagraph': 'Post Paragraph',
			'quoteParagraph': 'Quote Paragraph'
		};

		this.discourseLevelGraphics = {
			'worldview': worldview,
			'model': model,
			'propositional': propositional,
			'conceptual': conceptual,
			'narrative': narrative
		}

		this.thumbnail = null;
	}
	
	componentDidMount() {
		const node = ReactDOM.findDOMNode(this.refs['Hit']);

		if (node) {
			this.setState({
				hitHeight: node.clientHeight
			});
		}

    	// this.quoteHits = document.querySelectorAll('.QuoteHit');
    	// this.clipboard = new Clipboard(this.quoteHits);
	}

	// Notice that we pass attributeName prop into the CustomHighlight component.
	// Because a search hit can be one of five different types of attributes, we
	// have to determine which attribute exists in the hit object, and adjust both
	// the header and attributeName prop accordingly.
	getAttributeName(hit) {
		const hitKeys = Object.keys(hit);

		if (hitKeys.includes('cardName')) return 'cardName';
		if (hitKeys.includes('cardSummary')) return 'cardSummary';
		if (hitKeys.includes('postName')) return 'postName';
		if (hitKeys.includes('cardParagraph')) return 'cardParagraph';
		if (hitKeys.includes('postParagraph')) return 'postParagraph';
		if (hitKeys.includes('quoteParagraph')) return 'quoteParagraph';
	}

	renderQuote(attributeName, rightQuoteStyle) {
		return (<div
			className="QuoteHit"
			data-clipboard-text={this.props.hit.quoteParagraph}
			style={ {overflowWrap: 'break-word'} }>

			<Col xs={2}>
				<img
					alt="left quote"
					src={quote}
					className="LeftQuote" />
			</Col>
			<Col xs={8}>
				<p>{this.props.hit.quoteName}</p>

				<CustomHighlight
					attributeName={attributeName}
					hit={this.props.hit} />
			</Col>
			<Col xs={2}>
				<img
					alt="right quote"
					src={quote}
					className="RightQuote"
					style={rightQuoteStyle} />
			</Col>
		</div>);
	}

	renderCard(discourseLevel, hitTextStyle, isTitleOrSummary, attributeHeader,
		attributeName, isPostHit) {

		// /{shortSlug}/{discourseLevel}/card
		// /{shortSlug}/{discourseLevel}/feed/{feedSlug} ... (etc)
		let href = '/';
		if (isTitleOrSummary) {
			href = '/' + this.props.hit.shortSlug + '/worldview/card';

		// Generate pretty paragraph query strings, like so:
		// http://localhost:3000/phantom-debate/worldview/text/?paragraph=73
		} else if (this.getAttributeName(this.props.hit) === 'cardParagraph') {
			const splitId = this.props.hit.id.split('-');
			href = '/' + this.props.hit.shortSlug + '/worldview/text/?paragraph=' +
				splitId[splitId.length-1];

		} else if (isPostHit) {
			href = '/' + this.props.hit.cardSlug + '/' +
				this.props.hit.discourseLevel + '/feed/' + this.props.hit.feedSlug
		}

		return (<a className="CardHit"
				href={href}
				style={ {overflowWrap: 'break-word'} }>

			<Col xs={3} className="hit-image">
				<img
					ref="loaded"
					alt="controversy card"
					src={this.props.hit.images.thumbnail.url}
					className="CardThumbnail"
					onError={ e => e.target.src = notFoundImage } />

				{ this.state.hitHeight > 147 && <img
					className="hit-level Left"
					src={discourseLevel}
					alt="the level of discussion" /> }
			</Col>
			<Col xs={9}>
				<span
					className="hit-text"
					style={hitTextStyle}>

					{isTitleOrSummary ? null : attributeHeader}
					<CustomHighlight
						attributeName={attributeName}
						hit={this.props.hit} />

				</span>
				{ this.state.hitHeight <= 147 && <img
					className="hit-level Right"
					src={discourseLevel}
					alt="the level of discussion" /> }
			</Col>
		</a>)
	}

	render() {
		const
			attributeName = this.props.hit ?
				this.getAttributeName(this.props.hit) :
				null,

			isTitleOrSummary = attributeName === 'cardName' 
				|| attributeName === 'cardSummary',

			hitTextStyle = isTitleOrSummary ?
				{
					fontFamily: 'LeagueGothic',
					textTransform: 'uppercase',
					fontSize: '20px',
					letterSpacing: '1px',
					lineHeight: '1.2'
				} :
				null,

			// For cardName and cardSummary, we will use the League Gothic font in white
			attributeHeader = this.props.hit && isTitleOrSummary ?
				<b>{this.hitHeader[attributeName] + ':'}</b> :
				null,

			discourseLevel = this.props.hit && this.props.hit.discourseLevel ?
				this.discourseLevelGraphics[this.props.hit.discourseLevel] :
				worldview,

			rightQuoteStyle = {
				position: 'relative',
				top: this.state.hitHeight - 50
			},

			isPostHit = (this.getAttributeName(this.props.hit) === 'postName') ||
				(this.getAttributeName(this.props.hit) === 'postParagraph');

		// If there is no images property, then the result is a quote
		return this.props.hit ?
			(<Row
				className="CardHit"
				ref="Hit"
				key={this.props.hit.objectID}>

				{ this.props.hit.images ?
					this.renderCard(discourseLevel, hitTextStyle, isTitleOrSummary,
						attributeHeader, attributeName, isPostHit) :
					this.renderQuote(attributeName, rightQuoteStyle) }
		
			</Row>) :
			null;
	}
}

export default withRouter(SearchResultComponent);
