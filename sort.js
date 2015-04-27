whenDomReady(function() {

	var sortContainers = document.getElementsByClassName('do-sort');

	for (var i = 0; i < sortContainers.length; i++) {
		createSorter(
			Array.prototype.slice.call(
				sortContainers[i].querySelectorAll('.name')),
			Array.prototype.slice.call(
				sortContainers[i].querySelectorAll('.name-container')));
	}

	function createSorter(nameList, nameContainers) {
		nameList.forEach(function(el) {
			el.draggable = true;
			el.id = '__drag__' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
			el.ondragstart = function(ev) {
				ev.dataTransfer.setData('text', ev.target.id);
			};
			el.style.top = el.offsetTop + 'px';
			el.style.left = el.offsetLeft + 'px';
		});
		nameList.forEach(function(el) {
			el.style.position = 'absolute';
		});
		nameContainers.forEach(function(el) {
			el.ondrop = function(ev) {
				ev.preventDefault();
			    var data = ev.dataTransfer.getData('text');
			    var nameEl = document.getElementById(data);
			    if (nameEl.parentNode == ev.target) {
			    	return;
			    }
			    ev.target.appendChild(nameEl);
			    if (/\breadjust\b/.test(ev.target.className)) {
			    	nameEl.style.top = '';
			    	nameEl.style.left = '';
					nameEl.style.top = nameEl.offsetTop + 'px';
					nameEl.style.left = nameEl.offsetLeft + 'px';
			    }
			};
			el.ondragover = function(ev) {
				ev.preventDefault();
			};
		});
	}

});
