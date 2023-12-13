

hanoi = (function () {
	//variable to represent the towers and disks on them
	var towers;
	//variable to store sequence of moves
	var moveSequence;
	//variable to represent the movement of disks during animation
	var diskMovements;
	//variable to record the starting time of each disk during animation
	var currentAnimationStartTime;
	//keeps track of interval timer for animation
	var animationTimerID = 0;
	var statusElement = document.getElementById("status");

	// This function returns the time in seconds since the program started (helper function)
	var base_time = 0;
	var getTime = function () {
		var now = (new Date).getTime();
		if (base_time == 0)
			base_time = now;
		return (now - base_time) / 1000.0;
	}


	// function to create a disk object for animation (helper function)
	var makeDisk = function (element, start_x, start_y, end_x, end_y, control_x, control_y, duration) {
		return {
			element: element,           // Reference to the HTML element representing the disk
			start_x: start_x,           // Initial X position of the disk
			start_y: start_y,           // Initial Y position of the disk
			end_x: end_x,               // Final X position of the disk
			end_y: end_y,               // Final Y position of the disk
			control_x: control_x,       // X position of the control point for Bezier curve
			control_y: control_y,       // Y position of the control point for Bezier curve
			duration: duration,         // Duration of the animation for this disk
		};
	};
	

	// sets up the towers and disks for the game
	var makeStacks = function () {

		// Remove existing disk elements from the towers
		for (var j in towers) {
			var stack = towers[j];
			for (var i in stack) {
				var disk = stack[i];
				disk.parentNode.removeChild(disk);
			}
		}

		// Reset the towers array to have empty arrays
		towers = [[], [], []]

		var body = document.getElementById("body");

		// Initialize the width for the disks
		var width = 190;

		// Creates disk elements, assigns them sizes, and positions them on the towers.
		for (var i = 0; i < nDisks && width > 20; i++) {
			var disk = document.createElement("img");
			body.appendChild(disk);
			// Push the disk onto the first tower (index 0) in the towers array
			towers[0].push(disk);
			disk.src = "disk.jpg";
			disk.style.position = "absolute";
			disk.style.width = width + "px";
			disk.style.height = 19 + "px";
			disk.style.left = Math.round(poles_mid[0] - width / 2) + "px";
			disk.style.top = Math.round(poles_bot - towers[0].length * 20) + "px";
			// Decrease the width for the next iteration
			width -= 10;
		}
	}

	// Creates pole elements to visually represent the towers.
	var makePoles = function () {
		// Initialize the poles_mid array to store the X positions of the poles
		poles_mid = []

		// Set X positions for the three poles
		poles_mid.push(150);
		poles_mid.push(350);
		poles_mid.push(550);

		// Set the top and bottom positions for the pole
		poles_top = 200;
		poles_bot = poles_top + 20 * 11;  // 20 pixels height for each of the 10 disks

		var body = document.getElementById("body");

		// Create and position the first pole (pole1)
		var pole1 = document.createElement("img");
		pole1.style.position = "absolute";
		pole1.style.width = "20px";
		pole1.style.height = poles_bot - poles_top + "px";
		pole1.style.left = poles_mid[0] - 10 + "px";
		pole1.style.top = poles_top + "px";
		pole1.src = "disk.jpg";
		body.appendChild(pole1);

		// Create and position the second pole (pole2)
		var pole2 = document.createElement("img");
		pole2.style.position = "absolute";
		pole2.style.width = "20px";
		pole2.style.height = poles_bot - poles_top + "px";
		pole2.style.left = poles_mid[1] - 10 + "px";
		pole2.style.top = poles_top + "px";
		pole2.src = "disk.jpg";
		body.appendChild(pole2);

		// Create and position the third pole (pole3)
		var pole3 = document.createElement("img");
		pole3.style.position = "absolute";
		pole3.style.width = "20px";
		pole3.style.height = poles_bot - poles_top + "px";
		pole3.style.left = poles_mid[2] - 10 + "px";
		pole3.style.top = poles_top + "px";
		pole3.src = "disk.jpg";
		body.appendChild(pole3);

		// Create and position the base
		var base = document.createElement("img");
		base.style.position = "absolute";
		base.style.height = "20px";
		base.style.left = poles_mid[0] - 100 + "px";
		base.style.width = poles_mid[2] - poles_mid[0] + 200 + "px";
		base.style.top = poles_bot + "px";
		base.src = "disk.jpg";
		body.appendChild(base);
	}

	//updates move sequence and moves disks from one tower to another
	var nextMove = function () {
		if (moveSequence.length == 0) {
			statusElement.textContent = "Finished";
			return;
		}
		// Update the status to display the number of moves remaining
		statusElement.textContent = moveSequence.length + " moves remaining";

		// Get the next move from the sequence
		var move = moveSequence.shift();
		// Pop a disk from the source tower and push it to the destination tower
		var disk = towers[move.from].pop();
		towers[move.to].push(disk);

		var pixelSpeed = 400.0 * speed; // pixels/sec

		// Initialize variables for animation details
		var start_x;
		var start_y;
		var end_x;
		var end_y;
		var control_x;
		var control_y;
		var duration;

		// Move up
		start_x = parseInt(disk.style.left);
		start_y = parseInt(disk.style.top);
		end_x = poles_mid[move.from] - parseInt(disk.style.width) / 2;
		end_y = poles_top;
		control_x = start_x;
		control_y = start_y + 20;
		duration = Math.abs(end_y - control_y) / pixelSpeed / 2;
		diskMovements.push(makeDisk(disk, start_x, start_y, end_x, end_y, control_x, control_y, duration));

		// Move up and across
		start_x = end_x;
		start_y = end_y;
		end_x = (poles_mid[move.from] + poles_mid[move.to]) / 2 - parseInt(disk.style.width) / 2;
		end_y = poles_top - 100;
		control_x = start_x;
		control_y = end_y;
		duration = Math.abs(control_y - start_y) / pixelSpeed / 2;
		diskMovements.push(makeDisk(disk, start_x, start_y, end_x, end_y, control_x, control_y, duration));

		// Move across and down
		start_x = end_x;
		start_y = end_y;
		end_x = poles_mid[move.to] - parseInt(disk.style.width) / 2;
		end_y = poles_top;
		control_x = end_x;
		control_y = start_y;
		duration = Math.abs(end_y - control_y) / pixelSpeed / 2;
		diskMovements.push(makeDisk(disk, start_x, start_y, end_x, end_y, control_x, control_y, duration));

		// Move down
		start_x = end_x;
		start_y = end_y;
		end_x = poles_mid[move.to] - parseInt(disk.style.width) / 2;
		end_y = poles_bot - towers[move.to].length * 20;
		control_x = end_x;
		control_y = end_y - 20;
		duration = Math.abs(control_y - start_y) / pixelSpeed / 2;
		diskMovements.push(makeDisk(disk, start_x, start_y, end_x, end_y, control_x, control_y, duration));
	}

	// main animation function responsible for moving disks, uses bezier curve
	var animate = function () {
		// Check if there are no more disk movements
		if (diskMovements.length == 0) {
			// If no more movements, generate the next move and reset the animation start time
			nextMove();
			currentAnimationStartTime = getTime();
		}
		if (diskMovements.length == 0) {
			stop();
			return;
		}

		var disk = diskMovements[0];

		// Calculate the current time factor (t) for the Bezier curve
		var t = (getTime() - currentAnimationStartTime) / disk.duration;
		if (t > 1.0)
			t = 1.0;

		// Calculate the current position (cur_x, cur_y) based on the Bezier curve equation
		var cur_x = disk.start_x * (1 - t) * (1 - t) +
			2 * disk.control_x * t * (1 - t) +
			disk.end_x * t * t;
		var cur_y = disk.start_y * (1 - t) * (1 - t) +
			2 * disk.control_y * t * (1 - t) +
			disk.end_y * t * t;

		// Update the disk element's position on the screen
		disk.element.style.left = Math.round(cur_x) + "px";
		disk.element.style.top = Math.round(cur_y) + "px";

		// Check if the animation for the current disk is complete
		if (t == 1.0) {
			// If complete, remove the disk movement from the array and reset the animation start time
			diskMovements.shift();
			currentAnimationStartTime = getTime();
		}
	}

	//this is recursive function to solve the towers of hanoi problem
	var solveHanoi = function (n, from, to) {
		var other = 3 - (from + to);

		if (n - 1 > 0) solveHanoi(n - 1, from, other);

		// Move a disk from => to;
		moveSequence.push({ from: from, to: to });

		if (n - 1 > 0) solveHanoi(n - 1, other, to);
	}

	//resets the game state by clearing move sequences and disk movements.
	var reset = function () {
		moveSequence = []
		diskMovements = []
		currentAnimationStartTime = 0;

		//invokes makeStacks() to setup towers and disks
		makeStacks();
		//invokes solveHanoi() to generate the move sequence
		solveHanoi(towers[0].length, 0, 2);

		statusElement.textContent = "";
	}

	// start the animation using setInterval
	var start = function () {
		if (!animationTimerID) {
			animationTimerID = setInterval(animate, 50);
			currentAnimationStartTime += getTime();
		}
	}

	// stop the animation using clearInterval
	var stop = function () {
		if (animationTimerID) {
			clearInterval(animationTimerID);
			currentAnimationStartTime -= getTime();
		}
		animationTimerID = 0;
	}

	// update the number of disks
	var setNumber = function () {
		nDisks = parseInt(document.getElementById("number").value);
		reset();
	}

	// update the animation speed
	var setSpeed = function () {
		speed = parseFloat(document.getElementById("speed").value);
	}

	makePoles();
	setSpeed();
	setNumber();

	return {
		start: start,
		stop: stop,
		reset: reset,
		setNumber: setNumber,
		setSpeed: setSpeed,
	};
})();
