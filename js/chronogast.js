$( document ).ready(function() {
	
var currentMission
var missions = [
	{
		mission:'',
		story:'Well done, we\'re getting some great data here. The Committee is really going to appreciate this. We have so few primary sources from your time. ',
		// bishop circle
		targetLong: -72.24403833977155,
		targetLat:   41.80666076954622
	},
	{
		mission:'',
		story:'Interesting, it\'s amazing to see how peaceful and orderly your time is. Storrs is quite different when it isn\'t flooded with refugees.',
		// royce circle
		targetLong: -72.24569624335043697826,
		targetLat:   41.80493686352093
	},
	{
		mission:'',
		story:'Wonderful. We\'re almost done. One more and the dataset will be complete. Then we can comapre it against the archives of the Committee fo the Presevation of Civilization. ',
		// von der mehden obelisk
		targetLong: -72.24569611258083,
		targetLat:   41.805246491024086
	},
	{
		mission:'',
		story:'That does it! You\'ve been incredibly helpful. We\'re not supposed to mention this, but... here\s a quick tip. Move to Canada. Ok? Your friend from the future is suggesting you go north. As far north as north goes.',
		//butt rock
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
	$('.debug').hide();
	$('#loading').hide();	
	$('#dialog').hide();	
	$('#begin').hide();	
	$('#intro').hide();	
	$('#requirements').hide();	
	$('#mission').hide();		
	$('#story').hide();	
	$('#end').hide();
	$('#distance-label').hide();	
	deleteFromLocal('distance');
	
	$.urlParam = function(name){
		var results = new RegExp('[\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
		if (results != null ) {
			return results[1] || 0;
		}
		//
	}
	
	if ($.urlParam('id') == 1){
		$('.debug').show();	
	}
	
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
	$('#next').hide();
	$('#transmission').show();
	$('#story p').html(missions[num].story);
	setTimeout(function hide(){
		$('#transmission').hide();
			$('#next').show();

	}, 3000);
}


function missionComplete() {
	//alert('Mission Complete')
	console.log('mission complete...');
	$('#mission').hide();
	loadStory(currentMission);
	$('#story').show();
	$('#scan').show();
	$('#distance-label').hide();

	currentMission++;
	//alert('Success! Mission '+num+' completed.');
	deleteFromLocal('distance');
	return;
}


function intro(){
	console.log('intro...');
}



function scan(num){
	//alert('Scan...');
	console.log('scanning...')
	
	$('#scan').hide();
	$('#distance-label').show();
	
	var targetLatitude		= missions[num].targetLat;
	var	targetLongitude	= missions[num].targetLong;
	console.log(targetLatitude)
	console.log(targetLongitude)
	var precision 			= 3; // how many meters before an update in temp. 
	var targetProximity	= 7; // how close, in meters, to the target for success
	
	function roughPosition(num){
		//console.log('num: '+num);
		var estimate = num.toPrecision(precision);
		//console.log('estimate: '+estimate);
		return estimate;	
	}
	
	function updateCell(target, value){
		$(target).hide().html(value).fadeIn(200);	
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
							tempMessage = Math.round(distance);
							$('#temp').removeClass('cooler').addClass('warmer');
							writeToLocal('distance', distance);
						} else if (oldDistance < distance) {
							tempMessage = Math.round(distance);
							$('#temp').removeClass('warmer').addClass('cooler');
							writeToLocal('distance', distance);
						}
					} else {
						tempMessage = Math.round(distance);
						$('#temp').removeClass('warmer').removeClass('cooler');
					}
				} else {
					console.log('oldDistance missing...');
					tempMessage = '--';
					writeToLocal('distance', distance);
				}	
			} else {
				alert('Locked in. Good job.');
				missionComplete();
				navigator.geolocation.clearWatch(id);
				return false;
			}
			updateCell('#temp', tempMessage)	
		
	} // end show_watch
	
	//navigator.geolocation.watchPosition(setInterval(show_watch, 3000), error_callback, {enableHighAccuracy: true, timeout: 2000, maximumAge: 1000});	
	id = navigator.geolocation.watchPosition(show_watch, error_callback, {enableHighAccuracy: true, timeout: 2000, maximumAge: 1000});	
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
	intro();
	$('#start').hide();
	$('#intro').show();
}));

$('#intro-complete').on('click',(function(e){
	loadMission(0);
	$('#intro').hide();
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