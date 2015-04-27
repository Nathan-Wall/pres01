var whenDomReady;

(function() {

	var isDomReady = false;
	var domready = [];
	var oldOnload = window.onload;
	window.onload = function() {
		isDomReady = true;
		if (oldOnload) {
			oldOnload.apply(this, arguments);
		}
		for (var i = 0; i < domready.length; i++) {
			domready[i]();
		}
		domready = [];
	};

	whenDomReady = function whenDomReady(f) {
		if (isDomReady) {
			f();
		} else {
			domready.push(f);
		}
	};

	function drawCurve(parent, curve, noAnimate, buttonAction) {
		if (curve == 'linear') {
			curve = 'cubic-bezier(0, 0, 1, 1)';
		}
		var points = /cubic-bezier\(\s*([\d\.\-]+)\,\s*([\d\.\-]+)\,\s*([\d\.\-]+)\,\s*([\d\.\-]+)\s*\)/.exec(curve);
		if (!points) {
			throw new Error('Could not parse curve "' + curve + '".');
		}
		var P = [+points[1],+points[2],+points[3],+points[4]];
		var canvas = document.createElement('canvas'), ctx = canvas.getContext("2d");
		var ymarks = [];
		var NUM_Y_MARKS = 20;
		var lastAnimation;
		var forceSingleAnimation = false;
		canvas.className = 'bezier-curve';
		canvas.width = '500';
		canvas.height = '500';
		parent.appendChild(canvas);
		return {
			animate: function(dir) {
				if (dir === true) {
					dir = 1;
					forceSingleAnimation = true;
				}
				ymarks = [];
				var start = 0,
					end = 1,
					x0 = P[0],
					y0 = P[1],
					x1 = P[2],
					y1 = P[3];
				if (lastAnimation) {
					lastAnimation.stop();
				}
				lastAnimation = animate(moveRectangle, 2000, dir,
					BezierEasing(x0, y0, x1, y1),
					function(t) { return t; },
					BezierEasing(x0, y0, x1, y1));
			}
		};
		function moveRectangle(t, p, px, py) {
			var minX = 150,
				minY = 150,
				maxX = 350,
				maxY = 350;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawAxes(ctx, minX, minY, maxX, maxY);
			ctx.beginPath();
			ctx.strokeStyle = 'rgb(0,0,0)';
			ctx.moveTo(minX, maxY);
			ctx.bezierCurveTo(
				P[0] * (maxX - minX) + minX,
				maxY - P[1] * (maxY - minY),
				P[2] * (maxX - minX) + minX,
				maxY - P[3] * (maxY - minY),
				maxX,
				minY);
			ctx.stroke();
			ctx.fillStyle = 'rgb(255,0,0)'; //"hsl("+Math.round(255*p)+",80%,50%)";
			var w = 10;
			var h = 10;
			ctx.fillRect(
				minX + (maxX - minX) * px - w / 2,
				maxY - (maxY - minY) * py - h / 2,
				w,
				h);
			if (ymarks.length < t * NUM_Y_MARKS) {
				ymarks.push(maxY - (maxY - minY) * py);
			}
			for (var i = 0; i < ymarks.length; i++) {
				ctx.beginPath();
				ctx.strokeStyle =
					'rgba(0,0,0,' + ymarkOpacity(i, ymarks.length) + ')';
				ctx.moveTo(minX, ymarks[i]);
				ctx.lineTo(maxX, ymarks[i]);
				ctx.stroke();
			}
			ctx.beginPath();
			ctx.strokeStyle = 'rgba(255,0,0,0.8)';
			var curY = maxY - (maxY - minY) * py;
			ctx.moveTo(minX, curY);
			ctx.lineTo(maxX, curY);
			ctx.stroke();
			ctx.fillStyle = 'rgb(255,0,0)';
			ctx.font = '34px sans';
			ctx.fillText(Math.round(py * 100) + '%', maxX + 5, curY + 10);
		}
		function animate(render, duration, dir, easing, easingX, easingY) {
		  var start = Date.now();
		  var killLoop = false;
		  (function loop () {
		    var p = (Date.now()-start)/duration;
		    if (dir == -1) {
		    	p = 1 - p;
		    }
		    if (p > 1 || killLoop || noAnimate || buttonAction && !forceSingleAnimation) {
		      render(1);
		    }
		    else {
		      requestAnimationFrame(loop);
		      render(dir == 1 ? p : 1 - p, easing(p), easingX(p), easingY(p));
		    }
		  }());
		  return {
		  	stop: function() {
		  		killLoop = true;
		  	}
		  };
		}
		function drawAxes(ctx, minX, minY, maxX, maxY) {
			ctx.strokeStyle = 'rgba(0,0,0,0.7)';
			drawAxis(ctx, minX, maxY, maxX, maxY, 1, 0);
			drawAxis(ctx, minX, minY, minX, maxY, 0, 1);
		}
		function drawAxis(ctx, x0, y0, x1, y1, dx, dy) {
			var crossWidth = 5;
			drawLine(ctx, x0, y0, x1, y1);
			if (dx == 0) {
				x0 = x0 - crossWidth;
				x1 = x1 + crossWidth;
				for (i = 0; i < 10; i++) {
					yi = (y1 - y0) * i / 10 + y0;
					drawLine(ctx, x0, yi, x1, yi);
				}
			}
			if (dy == 0) {
				y0 = y0 - crossWidth;
				y1 = y1 + crossWidth;
				for (i = 0; i < 10; i++) {
					xi = (x0 - x1) * i / 10 + x1;
					drawLine(ctx, xi, y0, xi, y1);
				}
			}
		}
		function drawLine(ctx, x0, y0, x1, y1) {
			ctx.beginPath();
			ctx.moveTo(x0, y0);
			ctx.lineTo(x1, y1);
			ctx.stroke();
		}
	}

	function ymarkOpacity(i, L) {
		var TOTAL = 12;
		var start = L - TOTAL;
		if (i <= start) {
			return 0;
		}
		return (i - start) / TOTAL;
	}

	whenDomReady(function() {
		var bbSetup = document.getElementsByClassName('active-for-beach-ball');
		for (var i = 0; i < bbSetup.length; i++) {
			var bbs = bbSetup[i];
			var balls =
				bbs.parentNode.parentNode.getElementsByClassName('beach-ball');
			for (var j = 0; j < balls.length; j++) {
				var ball = balls[j];
				var id = 'beach-ball-' + (i * 100 + j);
				ball.id = id;
				var el = document.createElement('style');
				el.type = 'text/css';
				el.innerHTML = bbs.innerText.replace(/\.ball\b/g, '#' + id);
				bbs.parentNode.parentNode.insertBefore(el, bbs.parentNode);
				var buttonAction = /\bbutton\-action\b/.test(bbs.className);
				ball.curve = drawCurve(bbs.parentNode.parentNode,
					/transform 2s ([^\;]+)\;/.exec(bbs.innerText)[1],
					/\bno\-animate\b/.test(bbs.className),
					buttonAction);
				if (buttonAction) {
					var button = document.createElement('input');
					button.type = 'button';
					button.value = ' Go ';
					button.style.position = 'absolute';
					button.style.top = '300px';
					button.style.left = '120px';
					button.style.fontSize = '30px';
					bbs.parentNode.parentNode.appendChild(button);
					ball.xButton = button;
					button.onclick = function() {
						button.ballGo();
						//ball.curve.animate(true);
					};
				}
			}
		}
	});

	whenDomReady(function() {
	  var dir = -1;
	  setInterval(move, 2000);
	  move();
	  function move() {
	    dir = -dir;
	    var dx = dir == 1 ? 500 : 0;
	    var els = document.getElementsByClassName('beach-ball');
	    for (var i = 0; i < els.length; i++) {
	    	var el = els[i];
	    	if (/\bbutton\-action\b/.test(el.className) &&
	    		!el.xAllowAnimation) {
	    		(function check(el) {
	    			if (el.xButton) {
	    				el.xButton.ballGo = function() {
	    					el.style.transition = 'transition 0s';
	    					el.style.transform = 'translate3d(0,0,0)';
	    					setTimeout(function() {
	    						el.style.transition = '';
	    						el.style.transform = 'translate3d(' + dx + 'px, 0, 0)';
	    					}, 0);
	    				};
	    				return;
	    			}
	    			setTimeout(check, 100);
	    		})(el);
	    		if (!el.style.transform) {
	    			el.style.transform = 'translate3d(0,0,0)';
	    		}
	    	} else {
	    		el.style.transform = 'translate3d(' + dx + 'px, 0, 0)';
	    	}
	    	el.curve.animate(dir);
	    }
	  }
	});

})();
