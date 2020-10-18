let visibleParkingDetails = null;

async function initMap() {
    const availableParkings = await fetchParkings();
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: {lat: 54.6881731, lng: 25.2787993},
    });
    let markers = resetMarkers(map, availableParkings);
    setInterval(async () => {
        const availableParkings = await fetchParkings();
        dropMarkers(markers);
        updateParkingDetails(availableParkings);
        markers = resetMarkers(map, availableParkings);
    }, 5000);
};

function updateParkingDetails(availableParkings) {
    if (visibleParkingDetails) {
        visibleParkingDetails = availableParkings.find(parking => parking.address === visibleParkingDetails.address)
        showParkingDetails(visibleParkingDetails)
    }
}

async function fetchParkings() {
    const response = await fetch(`/api/streets`);
    return await response.json();
}

function dropMarkers(markers) {
    markers.forEach(marker => marker.setMap(null));
}

function resetMarkers(map, availableParkings) {
    return availableParkings.map(parking => {
        const freeSpaces = parking.totalSpots - parking.takenSpots;
        const numberPadding = freeSpaces < 10 ? '1px 7px;' : '2px;';
        const numberColor = freeSpaces > 0 ? 'green' : 'red';
        const marker = new MarkerWithLabel({
            position: parking.location,
            icon: new google.maps.MarkerImage('img/logo.png', null, null, null, new google.maps.Size(39, 60)),
            labelContent:
                '<div style="font-size: 18px; font-weight: bolder; display: flex; flex-direction:column;">' +
                `<span style="text-align:center; color: white; background-color: ${numberColor}; border-radius: 50%; padding: ${numberPadding}">${freeSpaces}</span>` +
                '</div>',
            labelAnchor: new google.maps.Point(13, 55),
            labelClass: "labels",
            labelStyle: {
                opacity: 1
            },
            map: map,
        });

        marker.addListener("click", () => showParkingDetails(parking));
        return marker;
    });
}

function showParkingDetails(parking) {
    visibleParkingDetails = parking;
    const parkingInfoHtml =
        '                            <div id="parking_info_container" class="col-lg-12 col-sm-12 col-xs-12">\n' +
        '                                <div class="section-header">\n' +
        `                                    <h2 class="section-title">${parking.address}</h2>\n` +
        '                                    <hr class="lines">\n' +
        '                                </div>\n' +
        '                                <div class="container">\n' +
        '                                    <div class="row">\n' +
        '                                        <div class="col-lg-6 col-sm-6 col-xs-12 box-item">\n' +
        `                                        <img class="parking_img" src="${parking.image}" alt="">` +
        '                                    </div>\n' +
        '                                        <div class="col-lg-6 col-sm-6 col-xs-12 box-item">\n' +
        '                                    <div class="row">\n' +
        '                                        <div class="col-lg-6 col-sm-6 col-xs-12 box-item">\n' +
        '                    <span class="icon">\n' +
        '                      <i class="lnr lnr-car"></i>\n' +
        '                    </span>\n' +
        '                                            <div class="text">\n' +
        '                                                <h4>Laisvu vietu skaicius</h4>\n' +
        `                                                <p>${parking.totalSpots - parking.takenSpots}</p>\n` +
        '                                            </div>\n' +
        '                                        </div>\n' +
        '                                        <div class="col-lg-6 col-sm-6 col-xs-12 box-item">\n' +
        '                    <span class="icon">\n' +
        '                      <i class="lnr lnr-apartment"></i>\n' +
        '                    </span>\n' +
        '                                            <div class="text">\n' +
        '                                                <h4>maksimalus vietu skaicius</h4>\n' +
        `                                                <p>${parking.totalSpots}</p>\n` +
        '                                            </div>\n' +
        '                                        </div>\n' +
        '                                        <div class="col-lg-6 col-sm-6 col-xs-12 box-item">\n' +
        '                    <span class="icon">\n' +
        '                      <i class="lnr lnr-calendar-full"></i>\n' +
        '                    </span>\n' +
        '                                            <div class="text">\n' +
        '                                                <h4>Informacija atnaujinta</h4>\n' +
        `                                              <p>${parking.updatedDate}</p>\n` +
        '                                            </div>\n' +
        '                                        </div>\n' +
        '                                        </div>\n' +
        '                                    </div>\n' +
        '                                    </div>\n' +
        '                                </div>\n' +
        '                        </div>';

    $('#parking_lot_info').html(parkingInfoHtml);
}
