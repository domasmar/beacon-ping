async function initMap() {
    const response = await fetch(`/api/streets`);
    const availableParkings = await response.json();

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: {lat: 54.6781767, lng: 25.2847437},
    });

    availableParkings.forEach(parking => {
        const marker = new MarkerWithLabel({
            position: parking.location,
            // icon: mapStyles.uavSymbolBlack,
            labelContent:
                '<div style="font-size: 14px; font-weight: bolder; display: flex; flex-direction:column;">' +
                `<span style="text-align:left; background-color: #54cb04; padding-left: 5px; border-radius: 25px;"><i class="lnr lnr-checkmark-circle"></i> ${parking.totalSpots - parking.takenSpots}</span>` +
                `<span style="text-align:left; background-color: #2ccbf7; padding-left: 5px; border-radius: 25px;"><i class="lnr lnr-car"></i> ${parking.totalSpots}</span>` +
                '</div>',
            labelAnchor: new google.maps.Point(20, 45),
            labelClass: "labels",
            labelStyle: {
                opacity: 1
            },
            map: map,
        });

        marker.addListener("click", () => showParkingDetails(parking));
    });
}

funx

function showParkingDetails(parking) {

    const parkingInfoHtml =
        '                            <div id="parking_info_container" class="col-lg-12 col-sm-12 col-xs-12">\n' +
        '                                <div class="section-header">\n' +
        `                                    <h2 class="section-title">${parking.address}</h2>\n` +
        '                                    <hr class="lines">\n' +
        '                                </div>\n' +
        '                                <div class="container">\n' +
        '                                    <div class="row">\n' +
        '                                        <div class="col-lg-4 col-sm-6 col-xs-12 box-item">\n' +
        '                    <span class="icon">\n' +
        '                      <i class="lnr lnr-car"></i>\n' +
        '                    </span>\n' +
        '                                            <div class="text">\n' +
        '                                                <h4>Laisvu vietu skaicius</h4>\n' +
        `                                                <p>${parking.totalSpots - parking.takenSpots}</p>\n` +
        '                                            </div>\n' +
        '                                        </div>\n' +
        '                                        <div class="col-lg-4 col-sm-6 col-xs-12 box-item">\n' +
        '                    <span class="icon">\n' +
        '                      <i class="lnr lnr-apartment"></i>\n' +
        '                    </span>\n' +
        '                                            <div class="text">\n' +
        '                                                <h4>maksimalus vietu skaicius</h4>\n' +
        `                                                <p>${parking.totalSpots}</p>\n` +
        '                                            </div>\n' +
        '                                        </div>\n' +
        '                                        <div class="col-lg-4 col-sm-6 col-xs-12 box-item">\n' +
        '                    <span class="icon">\n' +
        '                      <i class="lnr lnr-calendar-full"></i>\n' +
        '                    </span>\n' +
        '                                            <div class="text">\n' +
        '                                                <h4>Informacija atnaujinta</h4>\n' +
        `                                              <p>${parking.updatedDate}</p>\n` +
        '                                            </div>\n' +
        '                                        </div>\n' +
        '                                    </div>\n' +
        '                                </div>\n' +
        '                        </div>';

    $('#parking_lot_info').html(parkingInfoHtml);
}
