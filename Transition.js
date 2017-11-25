class Transition {

	constructor(startValue, endValue, period, currentTime) {
		this.startValue = startValue;
		this.endValue = endValue;
		this.change = endValue - startValue;
		this.period = period;
		this.isTransitioning = false;

		if (startValue != endValue) {
			this.start(currentTime);
		}
	}

	start(time) {
		this.startTime = time;
		this.isTransitioning = true;
	}

	updateEnd(end) {
		this.endValue = end;
	}

	value(currentTime) {
		let percentTime = (currentTime - this.startTime) / this.period;
		if (percentTime >= 1 || !this.isTransitioning) {

			this.isTransitioning = false;
			return this.endValue;
		}
		return this.startValue + this.change * percentTime;
	}

}