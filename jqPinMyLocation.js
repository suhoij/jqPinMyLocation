(function( $ ) {
	var geocoder = new google.maps.Geocoder();
	var map = null;
	var mapElement = null;
	var settings = null;
	var kharkivCoordinates = {
		latitude : 49.99703128549135,
		longitude:36.230383000000074
	};

	/**
	 * Private methods
	 */

	/**
	 * Fallback function. If we can not get the coordinates
	 * from geocoder we will set hardcoded values by default to show map.
	 */
	var setKharkivLocation = function() {
		setLocation( new google.maps.LatLng(kharkivCoordinates.latitude,kharkivCoordinates.longitude) );
	}

	/**
	 * Will try to get the coordinates of the provided address,
	 * and, if not found, try to geocode current position, if this also failure
	 * set the Kharkiv as the default point.
	 * @param settings
	 */
	var setDefaultLocation = function( settings ) {
		if( settings.address !== undefined ) {
			setLocationByAddress(settings.address);
		} else {
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					setLocation( new google.maps.LatLng(position.coords.latitude,position.coords.longitude) );
				}, function() {
					setKharkivLocation();
				});
			} else {
				setKharkivLocation();
			}
		}
	};

	/**
	 * Will try to geocode the provided address
	 * and set the location on success. On failure will set the location
	 * on default value.
	 * @param address
	 */
	var setLocationByAddress = function( address ) {
		var location = null;
		geocoder.geocode( { 'address': address }, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				setLocation(results[0].geometry.location);
			} else {
				setKharkivLocation();
			}
		});
	}

	/**
	 * Will center the map on provided location
	 * and create the active marker in this location.
	 * @param location
	 */
	var setLocation = function( location ) {
		map.setCenter(location);
		createActiveMarker(location);
	}

	/**
	 * Will create new marker with provided
	 * coordinates, which the user can drag.
	 * When the user will drop the marker,
	 * new coordinates will be send to server.
	 * @param position
	 */
	var createActiveMarker = function( position ) {
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			draggable : true
		});
		google.maps.event.addListener(marker, 'dragend', function(e) {
			sendNewPositionToServer(e.latLng);
		});
	}

	/**
	 * Will send latitude, longitude and
	 * additionalData, set in options, to serverUrl url.
	 * @param LatLng
	 */
	var sendNewPositionToServer = function(LatLng) {
		var coordinates = {
			latitude 	: LatLng.lat(),
			longitude 	: LatLng.lng()
		};
		if( settings.serverUrl !== undefined ) {
			$.ajax({
				url : settings.serverUrl,
				type : (settings.requesttype !== undefined)? settings.requesttype  : 'get',
				data :$.extend(coordinates, settings.additionalData),
				success : function() {

				}
			});
		}
	};

	/**
	 * Initialize google map on html element.
	 * @param settings
	 */
	var initMap = function( settings ) {
		mapElement = this[0];
		map = new google.maps.Map(mapElement, settings);
	};


	/**
	 * Public plugin methods.
	 */
	var methods = {

		/**
		 * Initialize plugin with provided options.
		 * Set default location on map.
		 * Initialize listeners.
		 * @param settings
		 */
		init : function( options ) {
			settings = $.extend( {
				zoom: 8,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				additionalData : {}
			}, options);
			initMap.call(this, settings);
			setDefaultLocation.call(this, settings);
		},

		setOption : function( option, value ) {

		}

	};


	$.fn.jqPinMyLocation = function( method ) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.jqPinMyLocation' );
		}
	};

})( jQuery );