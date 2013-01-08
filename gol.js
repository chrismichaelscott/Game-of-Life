/**
Copyright (c) 2013 chris.scott@factmint.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
window['GOL'] = function(svg, options) {
	this.cellArray = {};
	this.toggleArray = {};
	this.keepRunning = false;
	this.blockSize = options.blockSize;
	
	this.start = function() {
		this.keepRunning = true;
		this.run(this);
	}
	
	this.stop = function() {
		this.keepRunning = false;
	}
	
	var width = svg.getAttribute('width');
	var height = svg.getAttribute('height');
	
	for (var x = 0; x < width; x += this.blockSize) {
		this.cellArray[x] = {};
		this.toggleArray[x] = {};
		for (var y = 0; y < height; y += this.blockSize) {
			var square = this.rect(x, y, this.blockSize, this.blockSize);
			square.onclick = options.listener;
			
			svg.appendChild(square);
			
			this.cellArray[x][y] = square;
			this.toggleArray[x][y] = false;
		}
	}
}

window['GOL'].prototype.rect = function(x, y, width, height) {
	var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	rect.setAttribute("x", x);
	rect.setAttribute("y", y);
	rect.setAttribute("width", width);
	rect.setAttribute("height", height);
	rect.setAttribute("fill","white");
	
	rect.alive = false;
	rect.toggle = function() {
		if (this.alive) {
			this.setAttribute("fill","white");
		} else {
			this.setAttribute("fill","red");
		}
		
		this.alive = (! this.alive);
	}
	
	return rect;
};

window['GOL'].prototype.clear = function() {
	for (var x in this.cellArray) for (var y in this.cellArray[x]) {
		if (this.cellArray[x][y].alive) {
			this.cellArray[x][y].toggle();
		}
	}
	return this;
}

window['GOL'].prototype.randomize = function(coverage) {
	for (var x in this.cellArray) for (var y in this.cellArray[x]) {
		var square = this.cellArray[x][y];
		if (Math.random() > coverage) {
			square.toggle();
		}
	}
	return this;
};

window['GOL'].prototype.build = function(liveCells) {
	for (var x = 0; x < liveCells.length; x++) {
		this.on(liveCells[x][0], liveCells[x][1]);
	}
};

window['GOL'].prototype.on = function(x, y) {
	x = x * this.blockSize, y = y * this.blockSize;
	if (!this.cellArray[x][y].alive) {
		this.cellArray[x][y].toggle();
	}
	return this;
};

window['GOL'].prototype.off = function(x, y) {
	x = x * this.blockSize, y = y * this.blockSize;
	if (this.cellArray[x][y].alive) {
		this.cellArray[x][y].toggle();
	}
	return this;
};

window['GOL'].prototype.step = function() {
	for (var x in this.cellArray) for (var y in this.cellArray[x]) {
		x = parseInt(x), y = parseInt(y);
	
		var cell = this.cellArray[x][y];
		var neighbourCount = 0;
		
		// W
		if (this.cellArray[x-this.blockSize] && this.cellArray[x-this.blockSize][y] && this.cellArray[x-this.blockSize][y].alive) neighbourCount++;
		// SW
		if (this.cellArray[x-this.blockSize] && this.cellArray[x-this.blockSize][y+this.blockSize] && this.cellArray[x-this.blockSize][y+this.blockSize].alive) neighbourCount++;
		// S
		if (this.cellArray[x][y+this.blockSize] && this.cellArray[x][y+this.blockSize].alive) neighbourCount++;
		// SE
		if (this.cellArray[x+this.blockSize] && this.cellArray[x+this.blockSize][y+this.blockSize] && this.cellArray[x+this.blockSize][y+this.blockSize].alive) neighbourCount++; 
		// E
		if (this.cellArray[x+this.blockSize] && this.cellArray[x+this.blockSize][y] && this.cellArray[x+this.blockSize][y].alive) neighbourCount++;
		// NE
		if (this.cellArray[x+this.blockSize] && this.cellArray[x+this.blockSize][y-this.blockSize] && this.cellArray[x+this.blockSize][y-this.blockSize].alive) neighbourCount++;
		// N
		if (this.cellArray[x][y-this.blockSize] && this.cellArray[x][y-this.blockSize].alive) neighbourCount++;
		// NW
		if (this.cellArray[x-this.blockSize] && this.cellArray[x-this.blockSize][y-this.blockSize] && this.cellArray[x-this.blockSize][y-this.blockSize].alive) neighbourCount++;
		
		if (
			(cell.alive == true && (neighbourCount > 3 || neighbourCount < 2))
			||
			(cell.alive == false && neighbourCount == 3)
		) {
			this.toggleArray[x][y] = true;
		}
	}
	
	var breaker = true;
	for (var x in this.toggleArray) for (var y in this.toggleArray[x]) {
		if (this.toggleArray[x][y]) {
			if (breaker) breaker = false;
			this.cellArray[x][y].toggle();
		}
		
		this.toggleArray[x][y] = false;
	}

	if (breaker) {
		this.stop();
	}
};

window['GOL'].prototype.run = function(reference) {
	reference.step();
	if (reference.keepRunning) {
		setTimeout(reference.run, 200, reference);
	}
};

window.onload = function() {
	var canvas = document.getElementById("gameOfLife");
	var game = new GOL(canvas, {blockSize: 6, listener: function(e) {
		if (!game.keepRunning) {
			e.target.toggle();
		}
	}});
	
	document.getElementById("start").onclick = function() {
		game.start();
	};
	document.getElementById("stop").onclick = function() {
		game.stop();
	};
	document.getElementById("step").onclick = function() {
		game.step();
	};
	document.getElementById("randomize").onclick = function() {
		game.randomize(0.9);
	};
	document.getElementById("clear").onclick = function() {
		game.stop();
		game.clear();
	};
};
