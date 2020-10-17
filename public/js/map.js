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
                '<span style="text-align:left; background-color: #54cb04; padding-left: 5px; border-radius: 25px;"><i class="lnr lnr-checkmark-circle"></i> ' + (parking.totalSpots - parking.takenSpots) + '</span>' +
                '<span style="text-align:left; background-color: #2ccbf7; padding-left: 5px; border-radius: 25px;"><i class="lnr lnr-car"></i> ' + parking.totalSpots + '</span>' +
                '</div>',
            labelAnchor: new google.maps.Point(20, 45),
            labelClass: "labels",
            labelStyle: {
                opacity: 1
            },
            map: map,
        });


        marker.addListener("click", async () => {
            const response = await fetch(`/map?parkingId=${parking.name}`);
            const myJson = await response.json();
            $.get('/views/parking_info.html', function (data) {
                const compiled = Handlebars.compile(data);
                $('#parking_lot_info').html(compiled(myJson));
            });
        });
    });
}
