import React, { Component } from 'react';
import TransitionGroup from 'react-addons-transition-group';
import Bounce from 'bounce.js';
import { Badge } from 'react-bootstrap';
import './MainStackOverlay.css';

import worldviews from '../../images/science-structure-worldviews.svg';
import models from '../../images/science-structure-models.svg';
import propositions from '../../images/science-structure-propositions.svg';
import concepts from '../../images/science-structure-concepts.svg';
import narratives from '../../images/science-structure-narratives.svg';

// Error/Logger Handling
import { log, logTitle } from '../../libs/utils';

class AnimatedMainStackOverlay extends Component {
	constructor(props) {
		super(props);

		this.splatIn = new Bounce();

		this.splatIn
			.translate({
				from: { x: 100, y: 0 },
				to: { x: 0, y: 0 },
				duration: 600,
				easing: "bounce",
				delay: 0,
				bounces: 4,
				stiffness: 4
			})
			.scale({
				from: { x: 1, y: 1 },
				to: { x: 0.1, y: 2.3 },
				easing: "sway",
				duration: 800,
				delay: 65,
				bounces: 4,
				stiffness: 2
			})
			.scale({
				from: { x: 1, y: 1},
				to: { x: 5, y: 1 },
				easing: "sway",
				duration: 300,
				delay: 30,
				bounces: 4,
				stiffness: 3
			});

		this.splatChange = new Bounce();

		this.splatChange
			.scale({
				from: { x: .8, y: 1 },
				to: { x: 1, y: 1 },
				easing: "bounce",
				duration: 500,
				delay: 0,
				bounces: 4,
				stiffness: 1
			})
			.scale({
				from: { x: 1, y: .8},
				to: { x: 1, y: 1 },
				easing: "bounce",
				duration: 500,
				delay: 0,
				bounces: 4,
				stiffness: 1
			});

		this.splatOut = new Bounce();

		this.splatOut
			.translate({
				from: { x: 0, y: 0 },
				to: { x: 500, y: 0 },
				duration: 1000,
				easing: "bounce",
				delay: 1800,
				bounces: 4,
				stiffness: 3
			})
			.skew({
				from: { x: 0, y: 0 },
				to: { x: 10, y: 0 },
				easing: "bounce",
				duration: 800,
				delay: 1750,
				bounces: 4,
				stiffness: 3
			})	

		this.clickHandler = this.clickHandler.bind(this);

		this.props = props;
	}

	swipedetect(el, callback) {
		let touchsurface = el,
			swipedir,
			startX,
			startY,
			distX,
			distY,
			threshold = 30, //required min distance traveled to be considered swipe
			restraint = 300, // maximum distance allowed at the same time in perpendicular direction
			allowedTime = 200, // maximum time allowed to travel that distance
			elapsedTime,
			startTime,
			handleswipe = callback || function(swipedir) {};
	  
		touchsurface.addEventListener('touchstart', function(e) {
			let touchobj = e.changedTouches[0];
			swipedir = 'none';
			// dist = 0;
			startX = touchobj.pageX;
			startY = touchobj.pageY;
			startTime = new Date().getTime(); // record time when finger first makes contact with surface

			// e.preventDefault();
		}, false);
	  
		// touchsurface.addEventListener('touchmove', function(e) {
		// 	e.preventDefault(); // prevent scrolling when inside DIV
		// }, false);
	  
		touchsurface.addEventListener('touchend', function(e) {
			let touchobj = e.changedTouches[0];

			distX = touchobj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
			distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
			elapsedTime = new Date().getTime() - startTime ;// get time elapsed

			if (elapsedTime <= allowedTime) { // first condition for swipe met
				if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) { // 2nd condition for horizontal swipe met
					swipedir = (distX < 0)?  'left' : 'right'; // if dist traveled is negative, it indicates left swipe
				}
				else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) { // 2nd condition for vertical swipe met
					swipedir = (distY < 0) ? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
				}
			}

			handleswipe(swipedir);
			// e.preventDefault();

		}, false);
	}

	componentWillAppear(callback) {
		const el = this.element;
		this.splatIn.applyTo(el, {onComplete: callback});
	}

	componentWillEnter(callback) {
		const el = this.element;
		this.splatIn.applyTo(el, {onComplete: callback});
	}

	componentDidEnter() {
	}

	componentWillLeave(callback) {
		const el = this.element;
		this.splatOut.applyTo(el, {remove: true, onComplete: callback});
	}

	componentDidLeave() {
	}

	componentDidMount() {
		const el = this.element;

		if (this.props.app.isMobile) {
			this.swipedetect(el, swipedir => {
				if (swipedir === "right") {
					this.props.deactivateOverlayHandler();
				}
			});

		} else {

		}
	}

	componentWillReceiveProps(nextProps) {
		const el = this.element;

		if (this.splatChange && nextProps.discourseLevel !== this.props.discourseLevel) {
			this.splatChange.applyTo(el);
		}
	}

	getPosition(element) {
		var xPosition = 0;
		var yPosition = 0;

		while(element) {
			xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
			yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
			element = element.offsetParent;
		}

		return { x: xPosition, y: yPosition };
	}

	clickHandler(e) {
		const
			el = this.element,
			y = e.clientY,
			height = el.offsetHeight,
			top = this.getPosition(el).y,
			percentY = (y - top)/height;

		let level = 0;

		if (percentY < -0.31) {
			level = 0;
		} else if (percentY < -0.10) {
			level = 1;
		} else if (percentY < 0.11) {
			level = 2;
		} else if (percentY < 0.33) {
			level = 3;
		} else {
			level = 4;
		}

		this.props.discourseHandler(level);

		logTitle('Clicked Overlay Level ' + level);
		log('percentY: ' + percentY);
		log('');
	}

	render() {
		const
			swipeOverlayContainerStyles = this.props.app.isMobile ?
				{
					height: 'initial',
					left: 0,
					top: '50%',
					transform: 'translateY(-50%)'
				} :

				{
					height: 'initial',
					right: '5%',
					top: '50%',
					transform: 'translateY(-50%)',
					width: 'initial'
				},

			swipeOverlayStyles = this.props.app.isMobile ?
				{
					display: 'block',
					height: '40vh',
					margin: '0 auto'
				} :

				{
					height: '40vh'
				},

			scienceLevelImages = [worldviews, models, propositions, concepts, narratives],
			worldviewLength = this.props.feeds['worldview'].length,
			modelLength = this.props.feeds['model'].length,
			propositionalLength = this.props.feeds['propositional'].length,
			conceptualLength = this.props.feeds['conceptual'].length,
			narrativeLength = this.props.feeds['narrative'].length;

		return (
			<div className="MainStackOverlay"
				style={swipeOverlayContainerStyles}>

				<div ref={c => this.element = c}>
					<img className="science-structure"
						alt="epistemology"
						src={scienceLevelImages[this.props.discourseLevel]}
						style={swipeOverlayStyles}
						onClick={this.clickHandler} />

					{ !this.props.feedsLoading && this.props.app.isDesktop &&
						this.props.discourse.overlay ?

						<div className='Badges'>

							<Badge className='WorldviewBadge'
								style={{top: '-175px', left: worldviewLength === 0 ? '-26px' : '-28px'}}>

								{worldviewLength}
							</Badge>
							<Badge className='ModelBadge'
								style={{top: '-82px', left: modelLength === 0 ? '-57px' : '-62px'}}>

								{modelLength}
							</Badge>
							<Badge className='PropositionalBadge'
								style={{top: '0px', left: propositionalLength === 0 ? '-65px' : '-70px'}}>

								{propositionalLength}
							</Badge>
							<Badge className='ConceptualBadge'
								style={{top: '87px', left: conceptualLength === 0 ? '-94px' : '-102px'}}>

								{conceptualLength}
							</Badge>
							<Badge className='NarrativeBadge'
								style={{top: '165px', left: narrativeLength === 0 ? '-111px' : '-123px'}}>

								{narrativeLength}
							</Badge>

						</div> : null }
					
				</div>

			</div>
		)
	}
}

class MainStackOverlayStateless extends Component {
	render() {
		return (
			<TransitionGroup component="div">
				{ this.props.active &&
					<AnimatedMainStackOverlay
						app={this.props.app}
						feeds={this.props.feeds}
						discourse={this.props.discourse}
						feedsLoading={this.props.feedsLoading}
						discourseLevel={this.props.discourseLevel}
						discourseHandler={this.props.discourseHandler}
						deactivateOverlayHandler={this.props.deactivateOverlayHandler} />
				}
			</TransitionGroup>
		);
	}
}

export default MainStackOverlayStateless;
