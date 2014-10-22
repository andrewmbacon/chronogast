$( document ).ready(function() {
	
var currentMission
var missions = [
	{
		mission:'Labor organizer, born 5 October 1907 in Alhambra, Illinois.',
		story:'BISHOP CENTER SUCCESS. A story element goes here. ',
		targetLong: -72.24403833977155,
		targetLat:   41.80666076954622
	},
	{
		mission:'Chief conductor of Lyric Records, 1917-1921',
		story:'VON DER MEHDEN OBELISK. A story element goes here. ',
		targetLong: -72.24569611258083,
		targetLat:   41.805246491024086
	},
	{
		mission:'A center of the town, beginning in your time.',
		story:'STORRS CENTER SUCCESS. A story element goes here. ',
		targetLong: -72.2433140595185,
		targetLat:   41.80493686352093
	},
	{
		mission:'SiO2 near the CRT',
		story:'QUARTZ SCULPTURE SUCCESS. A story element goes here. ',
		targetLong: -72.24567190414,
		targetLat:   41.804168313454
	}
]
var totalMissions = missions.length

var missionText = [
	'This is the clue for mission zero.',
	'Mission one clue here.',
	'I am mission two.'
];
var storyText = [
	'After completing mission zero, the player reads this bit of story.',
	'With mission one completed, here is smore more narrative.',
	'Here is a bit more story for finishing mission 2.'
];
function init(){
	$('#begin').hide();	
	$('#requirements').hide();	
	$('#mission').hide();		
	$('#story').hide();	
	$('#end').hide();
	deleteFromLocal('distance');
}

function mobileCheck(){
	if (jQuery.browser.mobile){
		$('#begin').show();
	} else {
		$('#begin').show();
		$('#requirements').show();
	}
}

function loadMission(num){
	var img = $('#mission img');
	var p = $('#mission p');
	img.attr('src', 'img/'+num+'.jpg');
	p.html(missions[num].mission);
	currentMission = num;
};



function loadStory(num){
	$('#story p').html(missions[num].story);
}


function missionComplete() {
	//alert('Mission Complete')
	console.log('mission complete...');
	$('#mission').hide();
	loadStory(currentMission);
	$('#story').show();
	currentMission++;
	//alert('Success! Mission '+num+' completed.');
	deleteFromLocal('distance');
	return;
}




function scan(num){
	//alert('Scan...');
	console.log('scanning...')
	
	var targetLatitude		= missions[num].targetLat;
	var	targetLongitude	= missions[num].targetLong;
	console.log(targetLatitude)
	console.log(targetLongitude)
	var precision 			= 3; // how many meters before an update in temp. 
	var targetProximity	= 15; // how close, in meters, to the target for success
	
	function roughPosition(num){
		//console.log('num: '+num);
		var estimate = num.toPrecision(precision);
		//console.log('estimate: '+estimate);
		return estimate;	
	}
	
	function updateCell(target, value){
		$(target).hide().html(value).fadeIn(150);	
	}
	function error_callback(){
		/*alert('What are you doing? We\'ve lost the signal...');
		location.reload();
		*/	
		alert('error callback')
	}
	updateCell('#target-longitude', targetLongitude);
	updateCell('#target-latitude', targetLatitude);
	
	// Play Hot or Cold.

	
	function show_watch(position){
		//alert('Watch Loop...')
		//alert('watch loop');
		console.log('show_watch...');
		
		var rawWatch = position.coords;
		/*
		var watchLong = roughPosition(rawWatch.longitude);
		var watchLat = roughPosition(rawWatch.latitude);
		*/
		var watchLong = rawWatch.longitude;
		var watchLat = rawWatch.latitude;
		
		updateCell('#watch-longitude', watchLong);
		updateCell('#watch-latitude', watchLat);
	
	
		// Measure distance from target
		
		//http://stackoverflow.com/questions/13840516/how-to-find-my-distance-to-a-known-location-in-javascript
		function distance(lon1, lat1, lon2, lat2) {
			var R = 6371; // Radius of the earth in km
			var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
			var dLon = (lon2-lon1).toRad(); 
			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
				  Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
				  Math.sin(dLon/2) * Math.sin(dLon/2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c; // Distance in km
			return d;
		}
		
		/** Converts numeric degrees to radians */
		if (typeof(Number.prototype.toRad) === "undefined") {
			Number.prototype.toRad = function() {
				return this * Math.PI / 180;
			}
		}
		// limit the decimals, and convert from km to meters. 
		distance  =  distance(rawWatch.longitude, rawWatch.latitude, targetLongitude, targetLatitude)*1000;	
		//alert('distance:'+distance)
		updateCell('#distance', distance);
		
		var oldDistance = readFromLocal('distance');
		//alert('oldDistance:'+oldDistance)

		console.log('oldDistance')
		console.log(oldDistance)
		
		var tempMessage = '';
		
			if (distance > targetProximity) {
				//alert('not yet.')
				if (oldDistance != null || 0){
					console.log('oldDistance exists...');
					
					var distanceDiff = oldDistance - distance;
					
					if (distanceDiff < 0){
						distanceDiff = distanceDiff * -1;	
					}
					
					if (distanceDiff >= precision) {
						if (oldDistance > distance) {
							tempMessage = 'Warmer...';
							writeToLocal('distance', distance);
						} else if (oldDistance < distance) {
							tempMessage = 'Cooler...';
							writeToLocal('distance', distance);
						}
					} else {
						tempMessage = 'About the same. Keep moving.';
					}
				} else {
					console.log('oldDistance missing...');
					tempMessage = 'Initializing... keep moving.';
					writeToLocal('distance', distance);
				}	
			} else {
				alert('Found it.');
				missionComplete();
				navigator.geolocation.clearWatch(id);
				return false;
			}
			updateCell('#temp', tempMessage)	
		
	} // end show_watch
	
	//navigator.geolocation.watchPosition(setInterval(show_watch, 3000), error_callback, {enableHighAccuracy: true, timeout: 2000, maximumAge: 1000});	
	id = navigator.geolocation.watchPosition(show_watch, error_callback, {enableHighAccuracy: true, timeout: 2000, maximumAge: 1000});	
	id 
} // end scan()



function clearCache(){
	 window.location.reload(true);
	 localStorage.clear();	
}






/*
function recordLocation(position) {
	console.log('show map...');
	
	var rawLocation = position.coords;
	
	targetLatitude = rawLocation.latitude;
	targetLongitude = rawLocation.longitude;
	
	//	console.log('long: '+ targetLongitude +', lat: '+ targetLatitude +', acc:'+ rawLocation.accuracy );
	
	
	
}
*/






/* UTILITIES */

function writeToLocal(localName, value){
	//console.log('writing to local...'+localName);
	var string = JSON.stringify(value);
	//console.log('string to local: '+string);
	localStorage.setItem(localName, string)
}

function readFromLocal(localName){
	//console.log('getting item from local...'+localName);
	var string = localStorage.getItem(localName);
	//console.log('string from local: '+JSON.parse(string));
	return JSON.parse(string);
}
function deleteFromLocal(localName){
	localStorage.removeItem(localName)
}


// ####### RUN #########



init();
mobileCheck();


$('#begin').on('click',(function(e){
	loadMission(0);
	$('#start').hide();
	$('#mission').show();
}));


$('#win').on('click',(function(e){
	missionComplete();

}));


$('#next').on('click',(function(e){
	if (currentMission >= totalMissions) {
		$('#story').hide();
		$('#end').show();
	} else {
		loadMission(currentMission);
		$('#story').hide();
		$('#mission').show();
	}
	
}));






$('#clear').on('click', function(){
	clearCache();
});

$('#scan').on('click', function(){
	scan(currentMission);
});

});