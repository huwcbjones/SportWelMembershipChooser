var Chooser = {};

Chooser.data = {};
Chooser.data.payg = {};
Chooser.data.membership = {};
var priceMap, membershipMap;

Chooser.options = {};
Chooser.options.subscriptions = {};

Chooser.options.membershipType = null;
Chooser.options.auTeam = null;
Chooser.options.facilities = [];
Chooser.options.frequency = {};

Chooser.history = {};
Chooser.history.currentPage = "membership";
Chooser.history.previousPage = null;


/**
 * on document.ready, attach listeners
 */
$(document).ready(function () {

    // Bind membership selection to membershipType property
    $("#membershipGroup").on("click", "input[name=membership]", function () {
        Chooser.options.membershipType = this.value;
    });

    // Bind AU Team selection to auTeam property
    $("#auTeamGroup").on("click", "input[name=auTeam]", function () {
        Chooser.options.subscriptions.sp = (this.value === "1");
        Chooser.options.auTeam = (this.value === "1");
    });

    // Bind facilities selection to enable facilities in frequency page
    $("#facilitiesGroup").on("click", "input[name=facilities]", function () {

        var itemID = this.value;
        var item = Chooser.data.getItem(itemID);
        var row = $("#freq-" + itemID);
        // Check if the checkbox is checked
        if ($(this).prop("checked") === true) {

            // Enable the frequency row
            // Push the data into options
            Chooser.options.facilities.push(itemID);
            Chooser.options.frequency[itemID] = {"time": 0, "peak": false};
            row.removeClass("hidden");
        } else {

            // Disable the frequency row
            // Remove the data from options
            var index = Chooser.options.facilities.indexOf(itemID);
            if (index > -1) {
                Chooser.options.facilities.splice(index, 1);
            }
            if (Chooser.options.frequency[itemID] !== null) {
                delete Chooser.options.frequency[itemID];
            }
            row.addClass("hidden");
        }

        // Bind frequency selection to frequency model
        row.on("click", "input[type=radio]", function () {
            Chooser.options.frequency[itemID].time = this.value;
        });

        // Bind peak selection to peak model
        row.on("click", "input[type=checkbox]", function () {
            Chooser.options.frequency[itemID].peak = $(this).prop("checked");
        });
    });

});

/**
 * Initialise Chooser
 *
 * 1) Populate membership selection
 * 2) Populate facilities selection & frequency selection
 *
 */
Chooser.init = function () {
    Chooser.data.getItem = function (itemID) {
        var key = itemID.split("-");
        var facility = Chooser.data.payg[key[0]];
        if (facility === "undefined") return null;
        var index = facility.index[key[1]];
        if (index === "undefined") return null;
        return facility.items[index];
    };

    // 1) Populate membership selection
    //<editor-fold desc="Membership Selection">
    var membershipTypes = $("#membershipTypes");
    for (var k in Chooser.data.membership) {
        if (!Chooser.data.membership.hasOwnProperty(k)) continue;
        if (typeof Chooser.data.membership[k] === 'function') continue;

        membershipTypes.append(
            "<label class=\"checkbox\">\n" +
            "    <input type=\"radio\" name=\"membership\" value=\"" + k + "\" id=\"membershipStudent\" required/>\n" +
            Chooser.data.membership[k].display + "\n" +
            "</label>"
        );
    }
    //</editor-fold>

    var frequencyTable = $("#frequencyTable");
    var facilitiesJSC = $("#facilities-jsc");
    var facilitiesRest = $("#facilities-rest");
    var facilities, item, facility;

    for (k in Chooser.data.payg) {
        if (!Chooser.data.payg.hasOwnProperty(k)) continue;
        if (k === "jsc") {
            facilities = facilitiesJSC;
        } else {
            facilities = facilitiesRest;
        }

        facility = Chooser.data.payg[k];
        facility.index = {};

        facilities.append("<h4>" + facility.display + "</h4>");

        for (var i in facility.items) {
            if (!facility.items.hasOwnProperty(i)) continue;
            item = Chooser.data.payg[k].items[i];
            facility.index[item.id] = i;

            var selector = "#facilities-" + k + "-" + item.id;
            if (item.requires.type.length !== 0) {
                $("#membershipGroup").on("click", "input[name=membership]", {"selector": selector, "requires": item.requires.type}, function (e) {
                    if (e.data.requires.includes(Chooser.options.membershipType)) {
                        $(e.data.selector).removeClass("hidden");
                    } else {
                        $(e.data.selector).addClass("hidden");
                    }
                });
            }

            if (item.excludes.type.length !== 0) {
                $("#membershipGroup").on("click", "input[name=membership]", {"selector": selector, "excludes": item.excludes.type}, function (e) {
                    if (e.data.excludes.includes(Chooser.options.membershipType)) {
                        $(e.data.selector).addClass("hidden");
                    } else {
                        $(e.data.selector).removeClass("hidden");
                    }
                });
            }

            facilities.append(
                "<label class=\"checkbox\" id=\"facilities-" + k + "-" + item.id + "\">\n" +
                "  <input type=\"checkbox\" name=\"facilities\" value=\"" + k + "-" + item.id + "\">\n" +
                item.display + "\n" +
                "</label>"
            );

            frequencyTable.append(
                "<tr id=\"freq-" + k + "-" + item.id + "\" class=\"hidden\">\n" +
                "  <th>" + item.display + "</th>\n" +
                "  <td><input type=\"radio\" name=\"frequency-" + k + "-" + item.id + "\" value=\"1\"/></td>\n" +
                "  <td><input type=\"radio\" name=\"frequency-" + k + "-" + item.id + "\" value=\"12\"/></td>\n" +
                "  <td><input type=\"radio\" name=\"frequency-" + k + "-" + item.id + "\" value=\"26\"/></td>\n" +
                "  <td><input type=\"radio\" name=\"frequency-" + k + "-" + item.id + "\" value=\"52\"/></td>\n" +
                "  <td><input type=\"radio\" name=\"frequency-" + k + "-" + item.id + "\" value=\"365\"/></td>\n" +
                "  <td><input type=\"radio\" name=\"frequency-" + k + "-" + item.id + "\" value=\"0\" checked/></td>\n" +
                "  <td><input type=\"checkbox\" name=\"peak-" + k + "-" + item.id + "\"/></td>\n" +
                "</tr>"
            );
        }

        facilities.append("<br />");
    }
};

Chooser.goToSportsTeams = function () {
    if (this.options.membershipType === null) {
        $('#membershipGroup').addClass('has-error');
        $('#membershipHelp').removeClass('hidden');
        return;
    } else {
        $('#membershipGroup').removeClass('has-error');
        $('#membershipHelp').addClass('hidden');
    }
    var page = "sports-teams";
    if (this.options.membershipType === "child") {
        page = "facilities";
    }
    Chooser.swapPage(page);
};

Chooser.goToFacilities = function () {
    if (this.options.auTeam === null) {
        $('#auTeamGroup').addClass('has-error');
        $('#auHelp').removeClass('hidden');
        return;
    } else {
        $('#auTeamGroup').removeClass('has-error');
        $('#auHelp').addClass('hidden');
    }

    Chooser.swapPage("facilities");
};

Chooser.goToFrequency = function () {
    if (Chooser.options.facilities.length === 0) {
        Chooser.calculateResult();
    } else {
        Chooser.swapPage("frequency");
    }
};

Chooser.swapPage = function (to) {
    var currentPage = Chooser.history.currentPage;
    var toPanel = $('#' + to + '-panel');
    var fromPanel = $('#' + currentPage + '-panel');
    var resultPanel = $("#result");
    switch (to) {
        case "sports-teams":
            if (Chooser.options.membershipType === "child") {
                if (currentPage === "facilities") {
                    $('#membership-panel').collapse('show');
                } else {
                    $('#facilities-panel').collapse('show');
                }
            } else {
                toPanel.collapse('show');
            }
            fromPanel.collapse('hide');
            break;
        case "results":
            resultPanel.fadeIn(500);
        default:
            if (currentPage === "results") {
                resultPanel.fadeOut(500);
            }
            toPanel.collapse('show');
            fromPanel.collapse('hide');
    }

    Chooser.history.previousPage = currentPage;
    Chooser.history.currentPage = to;
};

Chooser.calculateResult = function () {
    var payg = Chooser.calculatePAYG();
    var totalPAYG = payg[0];
    var peakPAYG = payg[1];
    var offPeakPAYG = totalPAYG - peakPAYG;

    var subscriptions = Chooser.data.membership[Chooser.options.membershipType];
    var type = $("#resultType");
    var price = $("#resultPrice");

    $("#resultLink").attr("href", subscriptions.link);
    type.val(subscriptions["display"]);

    // Check if Child
    //<editor-fold desc="Child">
    if (Chooser.options.membershipType === "child") {
        Chooser.addInfo("Selected child membership...\n");

        var childPrice = subscriptions["child"]["price"];
        if (subscriptions["child"]["type"] === "month") childPrice *= 12;
        if (totalPAYG <= childPrice) {
            Chooser.addInfo("PAYG is cheaper than child by £" + (childPrice - totalPAYG).toFixed(2) + "\n");

            type.val(type.val() + " - PAYG");
            price.val("£" + totalPAYG + " (estimated)");

            Chooser._printSubscription(subscriptions["display"], "Pay As You Go", totalPAYG);
        } else {
            Chooser.addInfo("Child is cheaper than PAYG by £" + (totalPAYG - childPrice).toFixed(2) + "\n");

            type.val(type.val() + " - " + subscriptions["child"]["display"]);
            price.val("£" + subscriptions["child"]["price"] + " (" + subscriptions["child"]["type"] + "ly)");

            Chooser.printSubscription(subscriptions, "child");
        }
        Chooser.swapPage("results");
        return;
    }
    //</editor-fold>

    Chooser.selectAvailableSubscriptions();

    Chooser.addInfo("\n========================================\n");
    Chooser.addInfo("                AU Team                 \n");
    Chooser.addInfo("========================================\n");
    Chooser.addInfo("Subscription requires AU use: " + (Chooser.options.auTeam ? "Yes" : "No") + "\n");

    // Convert monthly prices into yearly prices
    //<editor-fold desc="Price Conversion">
    var spPrice = subscriptions.sp.price;
    var ffPrice = subscriptions.ff.price;
    var ppPrice = subscriptions.pp.price;
    var wcPrice = subscriptions.wc.price;
    if (subscriptions.sp.type === "month") spPrice *= 12;
    if (subscriptions.ff.type === "month") ffPrice *= 12;
    if (subscriptions.pp.type === "month") ppPrice *= 12;
    if (subscriptions.wc.type === "month") wcPrice *= 12;

    Chooser.addInfo("\n========================================\n");
    Chooser.addInfo("             Cost per Year              \n");
    Chooser.addInfo("========================================\n");
    Chooser.addInfo("Workout Central:  £" + wcPrice.toFixed(2) + (Chooser.options.subscriptions.wc === false? "*": "") + "\n");
    Chooser.addInfo("Sports Pass:      £" + spPrice.toFixed(2) + (Chooser.options.subscriptions.sp === false? "*": "") + "\n");
    Chooser.addInfo("Frequent Fitness: £" + ffPrice.toFixed(2) + (Chooser.options.subscriptions.ff === false? "*": "") + "\n");
    Chooser.addInfo("Peak Performer:   £" + ppPrice.toFixed(2) + (Chooser.options.subscriptions.pp === false? "*": "") + "\n");
    Chooser.addInfo(" * does not meet requirements\n");
    //</editor-fold>

    // Check if Sports Pass (+ PAYG) is cheaper
    //<editor-fold desc="Sports Pass">
    if (
        Chooser.options.auTeam && (
            Chooser.options.subscriptions.sp === true
            || (spPrice + offPeakPAYG <= ffPrice && spPrice + peakPAYG <= ppPrice)
        )
    ) {
        if (totalPAYG === 0) {
            type.val(type.val() + " - " + subscriptions["sp"]["display"]);
            price.val("£" + subscriptions["sp"]["price"] + " (" + subscriptions["sp"]["type"] + "ly)");

            Chooser.printSubscription(subscriptions, "sp");
        } else {
            type.val(type.val() + " - " + subscriptions["sp"]["display"] + " + PAYG");
            price.val("£" + subscriptions["sp"]["price"] + " (" + subscriptions["sp"]["type"] + "ly) - £" + totalPAYG + " (estimated PAYG)");

            Chooser.printSubscription(subscriptions, "sp", totalPAYG);
        }
        Chooser.swapPage("results");
        return;
    }
    //</editor-fold>

    // Check if Workout Central (+ PAYG) is cheaper
    //<editor-fold desc="Workout Central">
    console.log(totalPAYG);
    console.log(peakPAYG);
    var wcPAYG = Chooser.calculateWCPAYG(totalPAYG, peakPAYG);
    var wcTotalPAYG = wcPAYG[0];
    var wcPeakPAYG = wcPAYG[1];
    var wcOffPeakPAYG = wcTotalPAYG - wcPeakPAYG;
    if (
        Chooser.options.subscriptions.wc === true
        && wcPrice + wcOffPeakPAYG <= ffPrice
        && wcPrice + wcPeakPAYG <= ppPrice
    ) {
        if (wcTotalPAYG === 0) {
            type.val(type.val() + " - " + subscriptions["wc"]["display"]);
            price.val("£" + subscriptions["wc"]["price"] + " (" + subscriptions["wc"]["type"] + "ly)");

            Chooser.printSubscription(subscriptions, "wc");
        } else {
            type.val(type.val() + " - " + subscriptions["wc"]["display"] + " + PAYG");
            price.val("£" + subscriptions["wc"]["price"] + " (" + subscriptions["wc"]["type"] + "ly) - £" + wcTotalPAYG + " (estimated PAYG)");

            Chooser.printSubscription(subscriptions, "wc");
        }
        Chooser.swapPage("results");
        return;
    }
    //</editor-fold>


    // Choose PP or FF
    //<editor-fold desc="Peak Performer/Frequent Fitness">
    if (
        ppPrice <= ffPrice + peakPAYG
    ) {
        type.val(type.val() + " - " + subscriptions["pp"]["display"]);
        price.val("£" + subscriptions["pp"]["price"] + " (" + subscriptions["pp"]["type"] + "ly)");

        Chooser.printSubscription(subscriptions, "pp");
    } else if (ffPrice <= totalPAYG) {
        if (peakPAYG !== 0) {
            type.val(type.val() + " - " + subscriptions["ff"]["display"] + " + PAYG");
            price.val("£" + subscriptions["ff"]["price"] + " (" + subscriptions["ff"]["type"] + "ly) - £" + peakPAYG + " (estimated PAYG)");

            Chooser.printSubscription(subscriptions, "ff", peakPAYG);
        } else {
            type.val(type.val() + " - " + subscriptions["ff"]["display"]);
            price.val("£" + subscriptions["ff"]["price"] + " (" + subscriptions["ff"]["type"] + "ly)");

            Chooser.printSubscription(subscriptions, "ff");
        }
    } else {
        type.val(type.val() + " - Pay As You Go");
        price.val("£" + totalPAYG + " (estimated PAYG)");

        Chooser._printSubscription(subscriptions["display"], "Pay As You Go", totalPAYG);
    }
    //</editor-fold>

    Chooser.swapPage("results");
};

/**
 * Print subscription details
 * @param membership Membership Type (Staff, Student, etc)
 * @param subscription Subscription Type (FF, FF + PAYG, etc)
 * @param price Price of total membership
 * @private
 */
Chooser._printSubscription = function (membership, subscription, price){
    Chooser.addInfo("\n========================================\n");
    Chooser.addInfo("      Best Membership/Subscription      \n");
    Chooser.addInfo("========================================\n");
    Chooser.addInfo(" Membership:    " + membership + "\n");
    Chooser.addInfo(" Subscription:  " + subscription + "\n");
    Chooser.addInfo(" £/year (est):  £" + ("      " + price.toFixed(2)).slice(-6) + "\n");
    Chooser.addInfo(" £/month (est): £" + ("      " + (price/12).toFixed(2)).slice(-6)+ "\n");
};

/**
 * Print Subscription Details
 * @param subscriptions List of subscriptions
 * @param type Subscription type
 * @param payg PAYG Cost
 */
Chooser.printSubscription = function (subscriptions, type, payg){
    if(payg !== undefined){
        Chooser._printSubscription(
            subscriptions["display"],
            subscriptions[type]["display"] + " + PAYG",
            subscriptions[type]["price"] + payg
        );
    } else {
        var price = subscriptions[type]["price"];
        if(subscriptions[type]["type"] === "month") price *= 12;
        Chooser._printSubscription(
            subscriptions["display"],
            subscriptions[type]["display"],
            price
        );
    }
};

Chooser.selectAvailableSubscriptions = function () {
    var item;
    var i;
    Chooser.options.subscriptions = {
        "wc": true,
        "sp": true,
        "ff": true,
        "pp": true
    };
    for (var f in Chooser.options.facilities) {
        item = Chooser.data.getItem(Chooser.options.facilities[f]);
        if (item.excludes.length !== 0) {
            for (i in item.excludes.sub) {
                if (!item.excludes.sub.hasOwnProperty(i)) continue;
                Chooser.options.subscriptions[item.excludes.sub[i]] = false;
            }
        }
        if (item.requires.length !== 0) {
            for (i in item.requires.sub) {
                if (!item.requires.sub.hasOwnProperty(i)) continue;
                Chooser.options.subscriptions[item.requires.sub[i]] = true;
            }
        }
    }

    if (Chooser.options.auTeam) {
        Chooser.options.subscriptions.wc = false;
    } else {
        Chooser.options.subscriptions.sp = false;
    }
};

Chooser.calculateWCPAYG = function (totalPAYG, peakPAYG) {
    var subtotal;
    var item;
    if (Chooser.options.facilities.indexOf("may-gym") !== -1) {
        item = Chooser.data.getItem("may-gym");
        subtotal = item.price * Chooser.options.frequency["may-gym"].time;
        if (totalPAYG !== 0) totalPAYG -= subtotal;
        if (peakPAYG !== 0) peakPAYG -= subtotal;
    }
    if (Chooser.options.facilities.indexOf("may-classes") !== -1) {
        item = Chooser.data.getItem("may-classes");
        subtotal = item.price * Chooser.options.frequency["may-classes"].time;

        if (totalPAYG !== 0) totalPAYG -= subtotal;
        if (peakPAYG !== 0) peakPAYG -= subtotal;
    }

    return [totalPAYG, peakPAYG];
};

Chooser.calculatePAYG = function () {
    Chooser.addInfo("========================================\n");
    Chooser.addInfo("           Pay As You Go Cost           \n");
    Chooser.addInfo("========================================\n");

    var total = 0;
    var peakTotal = 0;
    var subtotal;
    for (var key in Chooser.options.frequency) {
        if (!Chooser.options.frequency.hasOwnProperty(key)) continue;
        var item = Chooser.data.getItem(key);
        var data = Chooser.options.frequency[key];
        subtotal = item.price * data.time;

        total += subtotal;
        if (data.peak) {
            peakTotal += subtotal;
        }

        var pad = ":    ";
        if (item.display.length < 25) {
            for (i = 0; i < (25 - item.display.length); i++) {
                pad += " ";
            }
        } else {
            pad = "...: "
        }
        Chooser.addInfo(" " + item.display.substring(0, 25) + pad + "£" + ("       " + subtotal.toFixed(2)).slice(-7) + (data.peak ? "*" : "") + "\n");

        if (item.excludes.sub.length !== 0) {
            for (var k in item.excludes.sub) {
                Chooser.options.subscriptions[item.excludes.sub[k]] = false;
            }
        }
        if (item.requires.sub.length !== 0) {
            for (k in Chooser.options.subscriptions) {
                if (!Chooser.options.subscriptions.hasOwnProperty(k)) continue;
                Chooser.options.subscriptions[k] = false;
            }
            for (k in item.requires.sub) {
                Chooser.options.subscriptions[item.requires.sub[k]] = true;
            }
        }
    }
    Chooser.addInfo(" * indicates peak time\n");

    Chooser.addInfo("\nSubtotal:\n");
    Chooser.addInfo(" Off Peak: £" + ("       " + (total - peakTotal).toFixed(2)).slice(-7) + "\n");
    Chooser.addInfo(" On Peak:  £" + ("       " + peakTotal.toFixed(2)).slice(-7) + "\n");
    Chooser.addInfo("Total:     £" + ("       " + total.toFixed(2)).slice(-7) + "\n");
    return [total, peakTotal];
};

Chooser.additionalInfo = $("#additionalInfo");
Chooser.addInfo = function (string) {
    Chooser.additionalInfo.append(string);
};

var loadingTimer = setTimeout(loadingStatus, 250);
function loadingStatus () {
    var loader  = $("#loading");
    if(loader.text().length === 3){
        loader.text("");
    }else {
        loader.text(loader.text() + ".");
    }
    loadingTimer = setTimeout(loadingStatus, 250);
}

$.getJSON("data.json", function (json) {
    console.log("Loaded data!");
    Chooser.data = json;

    $("#loadingStatus").remove();
    clearInterval(loadingTimer);

    Chooser.init();
});