var statesByAbbreviation = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}

var solarHoursByState = {
    AL: 4.5,
    AK: 2.5,
    AZ: 5.5,
    AR: 4.5,
    CA: 5,
    CO: 5,
    CT: 4.2,
    DE: 4.5,
    FL: 4.5,
    GA: 4.5,
    HI: 6,
    ID: 4.5,
    IL: 4.3,
    IN: 4.3,
    IA: 4.3,
    KS: 4.3,
    KY: 4.5,
    LA: 4.5,
    ME: 4.2,
    MD: 4.5,
    MA: 4.2,
    MI: 4.2,
    MN: 4.2,
    MS: 4.5,
    MO: 4.5,
    MT: 4.5,
    NE: 4.5,
    NV: 5,
    NH: 4.2,
    NJ: 4.2,
    NM: 5.5,
    NY: 4.2,
    NC: 4.5,
    ND: 4.2,
    OH: 4.2,
    OK: 4.6,
    OR: 4.5,
    PA: 4.2,
    RI: 4.2,
    SC: 4.5,
    SD: 4.2,
    TN: 4.5,
    TX: 5,
    UT: 5,
    VT: 4.2,
    VA: 4.2,
    WA: 4,
    WV: 4.2,
    WI: 4.2,
    WY: 4.7
}

// calculate how many panels one would need to generate the same power
function calculateRequiredSolarPanels(bill, state) {
    var actualHours = solarHoursByState[state] - 1.35;
    var kwPerMonth = bill / 0.12;
    var kwPerYear = kwPerMonth * 12;
    var kwPerDay = kwPerYear / 365; 

    return Math.ceil(kwPerDay / actualHours);
}

// calculate how much it would cost to install solar panels to cover the bill 
function calculateSolarInstallation(bill, state) {
    var kwPerHour = calculateRequiredSolarPanels(bill, state);

    return kwPerHour * 1000 * 4;
}

// calculate solar co-op cost to cover the bill
function calculateSolarCoop(bill) {
    return bill * 12 / 0.069;
}

// calculate difference between solar installation vs solar Co-op
function calculateSavings(solarCost, solarCoopCost) {
    return solarCost - solarCoopCost;
}

// Calculate savings percentage
function calculateSavingsPercentage(solarCost, solarCoopCost) {       
    var percent = (solarCost - solarCoopCost) / solarCost; 
    return Math.round(percent * 100);
}

$(document).ready(function() {

    var input = $('#solar-input-wrapper');
    var map = $('#map');
    var selectedState = 'AL';

    // populate <select> with states (for devices < 720px)
    for (var key in statesByAbbreviation) {
        if (statesByAbbreviation.hasOwnProperty(key)) {
            $('#state-select').append($('<option>', {
                value: key,
                text: statesByAbbreviation[key]
            }));
        }
    }

    // Generate map if it's bigger than 720px
    $(window).resize(function() {
        if ( $(window).width() > 720 && map.css("display") == "block") {
            generateMap();
        }
    });

    if (map.css("display") == "block") {
        generateMap();
    }

    $("#state-select").change(function() {
        selectedState = $('#state-select').val();

        if (map.css("display") == "block") {
            map.usmap('trigger', selectedState, 'click');
        }
    });

    input.on('click', '#calculate-btn', function(e) {
        monthlyBill = parseInt($('.investment-input')[0].value);
        updateOutputDiv(monthlyBill, selectedState);
    });

    function updateOutputDiv(monthlyBill, selectedState) {
        var solarCost = calculateSolarInstallation(monthlyBill, selectedState);
        $('#solar-cost').text(accounting.formatMoney(solarCost));

        var solarCoopCost = calculateSolarCoop(monthlyBill);
        $('#solar-coop-cost').text(accounting.formatMoney(solarCoopCost));

        var savings = calculateSavings(solarCost, solarCoopCost);
        $('#savings').text(accounting.formatMoney(savings));

        var savingsPercentage = calculateSavingsPercentage(solarCost, solarCoopCost);
        $('#savings-percentage').text(savingsPercentage + '%'); 
        $('#solar-output-wrapper').show();
    }

    function generateMap() {
        $('#map').usmap({
            stateHoverStyles: {
                fill: '#ccc'
            },
            stateHoverAnimation: 300,
            click: function(event, data) {
                $("#map > svg > path").each(function(){
                    $(this).css('fill', '');
                });
                $('#' + data.name).css('fill', '#ccc');
                selectedState = data.name;
                $('#state-select').val(selectedState);
                $('#selected-state-text').text('Selected State: ' + statesByAbbreviation[selectedState]);
                if ($('#solar-output-wrapper').attr('style') == 'display: block;'){
                    updateOutputDiv(monthlyBill, selectedState);
                }
            }
        });

        if (selectedState) {
            $('#map').usmap('trigger', selectedState, 'click');
        }
    }
});
