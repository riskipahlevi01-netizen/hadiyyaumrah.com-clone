"use strict";

let site = "https://hadiyyaumrah.com";

/** Dashboard Logged in user menu */
let myCredential, myAuthToken, myAuthRole;

$(document).ready(function() {
  // Get listing id.
  /**
  if (window.location.href.includes("/listings/")) {
    bookingUrl = $(".mb-2 a#login").attr("href");
    if (typeof bookingUrl !== "undefined" && 
      bookingUrl !== null && 
      bookingUrl != "null"
    ) {
      const queryString = parseQueryString(bookingUrl);
      listingId = queryString.listing_id;
      console.log("Listing id: " + listingId);
    }
  }
  */

  // Get agent ref code.
  const agentRefCode = window.localStorage.getItem("agentReferralCode");

  // Get saved credentials.
  const myCurrentCredential = window.localStorage.getItem("currentCredential");
  //console.log(myCurrentCredential);

  if (typeof myCurrentCredential !== "undefined" && 
      myCurrentCredential !== null && 
      myCurrentCredential != "null"
  ) {
    myCredential = JSON.parse(myCurrentCredential);
    myAuthToken = myCredential.auth_token;
    myAuthRole = myCredential.role;
  }

  if (myAuthToken) {
    //console.log("Authenticated role: " + myAuthRole);

    // Replace login menu with logged-in menu.
    switch (myAuthRole) {
      case "ROOT":
      case "MAIN":
      case "AGENT":
        $("li#menu-logged-in").html('<span><a href="#0" class="sub-menu">Akun Saya</a></span><ul><li><a href="/app_v2/#/admin">Dashboard</a></li><li><a href="/app_v2/#/admin/my-account">Profile</a></li><li><a href="/app_v2/#/admin/transactions/invoices">Invoices</a></li><li><a href="#logout" onclick="javascript:logOut();">Logout</a></li></ul>');
      break;
      case "USER":
      default:
        $("li#menu-logged-in").html('<span><a href="#0" class="sub-menu">Akun Saya</a></span><ul><li><a href="/app_v2/#/user">Dashboard</a></li><li><a href="/app_v2/#/user/my-account">Profile</a></li><li><a href="/app_v2/#/user/booking">Invoices</a></li><li><a href="#logout" onclick="javascript:logOut();">Logout</a></li></ul>');
      break;
    }
  } else {
    //console.log("Auth not logged in.");
  }

  /* List bank method */
  getBankLists(site);

  /* Customize page styling */
  customizePageStyle();
  
  /* Listing */
  getPackageList(site);
});

const loginSuccess = (credential = "{}", redirect = "", referral = 0) => {
  let authCredential = JSON.parse(credential);

  if (! authCredential.role) {
    authCredential.role = "USER";
  }

  let authRole = authCredential.role,
      redirectUrl = "";

  console.log("Authenticated role: " + authRole);

  if (authRole) {
    $("#userLoginModal h5.modal-title").html("Login Berhasil");
    $("#login div.alert").removeClass("alert-danger").addClass("alert-info")
      .html("Sedang melanjutkan ke halaman booking. Mohon tunggu!")
      .show().delay(1000).fadeIn();
    $("div#login form").hide().delay(3000).fadeOut();

    // Save logged-in credentials.
    window.localStorage.setItem("currentCredential", JSON.stringify(authCredential));

    if (authRole === "ROOT" || authRole === "MAIN" || authRole === "AGENT") {
      if (!isNaN(redirect)) {
        redirectUrl = "/app_v2/#/admin/transactions/booking/add?listing_id=" + redirect;
      } else {
        redirectUrl = redirect;
      }
    } else if (authRole === "USER") {
      if (!isNaN(redirect)) {
        redirectUrl = "/app_v2/#/user/booking/add?listing_id=" + redirect;

        if (referral > 0) {
          redirectUrl += "&ref=" + referral;
        }
      } else {
        redirectUrl = redirect;
      }
    } else {
      redirectUrl = redirect;
    }

    console.log("Redirected to: " + redirectUrl);

    if (redirectUrl) {
      window.location.replace(redirectUrl);
    } else {
      window.location.reload();
    }
  } else {
    console.log("No credentials received.");
  }
};

const loginFail = (response = "{}") => {
  let res = JSON.parse(response);

  $("#login div.alert").removeClass("alert-info").addClass("alert-danger").html(res.msg);
  $("#login div.alert").show().delay(500).fadeIn();
  $("#login div.alert").delay(6000).fadeOut("slow");

  console.log("Login failed: " + res.msg);
};

const forgetPasswordSuccess = (response = "{}") => {
  let res = JSON.parse(response);

  $("#forget-password div.alert").removeClass("alert-danger").addClass("alert-info").html(res.msg);
  $("#forget-password div.alert").show().delay(500).fadeIn();
  $("#forget-password div.alert").delay(6000).fadeOut("slow");
};

const forgetPasswordFail = (response = "{}") => {
  let res = JSON.parse(response);

  $("#forget-password div.alert").removeClass("alert-info").addClass("alert-danger").html(res.msg);
  $("#forget-password div.alert").show().delay(500).fadeIn();
  $("#forget-password div.alert").delay(6000).fadeOut("slow");
};

const logOut = (redirectUrl = "") => {
  window.localStorage.removeItem("currentCredential");

  if (redirectUrl) {
    window.location.replace(redirectUrl);
  } else {
    window.location.reload();
  }
};

const parseQueryString = (query = "") => {
  const urlParts = query.split("?");
  let params;

  if (urlParts) {
    params = urlParts[1].split("&");
  } else {
    params = query.split("&");
  }

  let queryString = {};

  for (let i = 0; i < params.length; i++) {
    let pair = params[i].split("=");
    let key = decodeURIComponent(pair.shift());
    let value = decodeURIComponent(pair.join("="));

    // If first entry with this name.
    if (typeof queryString[key] === "undefined") {
      queryString[key] = value;
      // If second entry with this name
    } else if (typeof queryString[key] === "string") {
      let arr = [queryString[key], value];
      queryString[key] = arr;
      // If third or later entry with this name
    } else {
      queryString[key].push(value);
    }
  }

  return queryString;
};

/**
 * Get current url parameter.
 *
 * Usage: const blog = getUrlParameter('blog');
 */
const getUrlParameter = (sParam) => {
  const sPageURL = window.location.search.substring(1);
  let sURLVariables = sPageURL.split('&');
  let sParameterName, i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }

  return false;
};

/**
 * Customize page style.
 *
 * Usage: for S&K page
 */
const customizePageStyle = () => {
  const section = getUrlParameter('section');
  const fullpage = getUrlParameter('fullpage');

  // Hide header, menu, footer, make full page view.
  if (fullpage == 1) {
    $("div#sub-header, div#header-top, header#header, section.hero_in, footer.site-footer, div#whatsapp-chat, div#chatBtn, div#toTop").hide();
    $("div#toTop").fadeOut();
  }

  // Scroll to selected section.
  if (section == "agent") {
    $("div#user").hide();
    $("main .post-content #agent").attr("style", "margin-bottom: 5rem !important;");
    $("main .container.margin_60_35").removeClass("margin_60_35");
    $("main .container.margin_80_55").removeClass("margin_80_55");
    $("html, body").animate({
      scrollTop: $("#agent").offset().top
    }, 1000);
  } else if (section == "user") {
    $("div#agent").hide();
    $("main .post-content #user").attr("style", "margin-bottom: 5rem !important;");
    $("main .container.margin_60_35").removeClass("margin_60_35");
    $("main .container.margin_80_55").removeClass("margin_80_55");
    $("html, body").animate({
      scrollTop: $("#user").offset().top
    }, 1000);
  }
};

/**
 * Get bank list
 * @param {*} site
 * @returns void modify DOM
 *
 * Usage:
 * JS part
 * $(document).ready(function() {
 *   getBankLists(site);
 * });
 *
 * HTML part
 * <div id="payments-method">
 *   <h5 class="mb-2">Rekening Pembayaran</h5>
 *   <!-- jQuery Bank Lists -->
 *   <ul class="bank-lists"></ul>
 * </div>
 */
const getBankLists = (site = "https://demo.muslimpergi.com") => {
  $.ajax({
    dataType: "json",
    url: site + "/api/banks.json",
    success: function(banks) {
      if (banks.length) {
        $.each(banks, function(id, bank) {
          let bankLogo = bank.logo;
          $("#payments-method .bank-lists")
          .append('<div id="bank-' + id + '"><div class="partner-title"><span class="fa fa-bank"></span> ' + bank.bank + ' (' + bank.currency + '):</div><div class="partner-payment"><img src="' + bank.logo.url + '" alt="Pembayaran via ' + bank.bank + '"><p class="mb-0">a.n. <strong>' + bank.name + '</strong><br>No. Rek <strong>' + bank.number + '</strong></p></div></div>');
        });
      } else {
        $("#payments-method .bank-lists").append('<strong>Belum ada informasi bank.</strong> Segera masukkan data rekening bank melalui menu <em><a href="/app_v2/#/admin/settings/banks" rel="nofollow" target="_blank">Pengaturan &raquo; Bank</a></em> pada dashboard admin!');
      }
    }
  });
};

/**
 * Get package list
 * @param {*} site
 * @returns void modify DOM
 *
 * Usage:
 * JS part
 * $(document).ready(function() {
 *   getPackageList('UMROH');
 * });
 */
const getPackageList = (site, category = "UMROH") => {
  /** Listings Umroh */
  $.ajax({
    dataType: "json",
    url: site + "/api/listings.json",
    data: "page=1&per_page=6&category=" + category.toUpperCase() + "&status=ACTIVE&sort=departure_at&sort_by=asc",
    success: (resp) => {
      const cat = category.toLowerCase();

      //let listings = resp.data.reverse();
      let listings = resp.data;

      $.each(listings, function(index, listing) {
        $("#listings_package div .jquery-listings")
          .append('<div class="col-12 col-md-6 col-lg-4 mb-5 isotope-item popular" id="listing-' + index + '"><div class="box_grid"><figure><img src="' + listing.pict.medium.url + '" class="img-fluid" alt="' + listing.name + '" loading="lazy"><small>' + listing.category + '</small></figure><div class="wrapper"><h3>' + listing.name + '</h3><div class="price"><ul class="p-0"><li><strong>' + priceFormatted(listing.price_start, listing.currency) + '</strong>/pax</li><li>&nbsp;</li></ul></div><table class="mt-1 mb-0 details table table-borderless"><tbody><tr><td><i class="fa fa-calendar"></i></td><td>Jadwal Berangkat</td><td>' + dateFormatted(listing.departure_at) + '</td></tr><tr><td><i class="fa fa-clock-o"></i></td><td>Durasi Perjalanan</td><td>' + listing.days + ' Hari</td></tr><tr><td><i class="fa fa-building-o"></i></td><td>Hotel Bintang</td><td class="rating"><span class="listing-star-rating-formatted">' + starsRating(listing.hotel_star) + '</span></td></tr><tr><td><i class="fa fa-user"></i></td><td>Total Seat</td><td>' + listing.total_pax + ' pax</td></tr><tr><td><i class="fa fa-user"></i></td><td style="font-weight:700">Available Seat</td><td style="font-weight:700">' + listing.available_seats + ' pax</td></tr><tr><td><i class="fa fa-map-marker"></i></td><td>Berangkat dari</td><td>' + listing.departure_from + '</td></tr><tr><td><i class="fa fa-plane"></i></td><td>Maskapai</td><td>' + getFlightName(site, listing.id) + '</td></tr></tbody></table><a href="' + site + '/listings/' + listing.slug + '/" class="btn_1 mt-2 btn-block font-weight-bold rounded">Lihat Detail</a></div></div></div>');
      });
    }
  });
}

/**
 * Formatted Price
 * Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
 * @param {*} number
 * @param {*} currency
 * @returns
 */
const priceFormatted = (number, currency = "IDR") => {
  let myLocale = (currency == "IDR") ? "id-ID" : "en-US";
  let formattedPrice = new Intl.NumberFormat(myLocale, {
    style: "currency",
    currency: currency
  }).format(number);
  return formattedPrice;
}

/**
 * Formatted Date
 * @param {*} date
 * @returns
 */
const dateFormatted = (date) => {
  let myDate = new Date(date);
  let formattedDate = myDate.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  return formattedDate;
}

/**
 * Stars Rating
 * @param {*} rating
 * @returns
 */
const starsRating = (rating) => {
  let starsTag = [];

  for (let i = 0; i < rating; i++) {
    starsTag.push('<i class="fa fa-star"></i>');
  }

  for (let i = 0; i < 5 - rating; i++) {
    starsTag.push('<i class="fa empty fa-star"></i>');
  }

  let htmlTag = starsTag.join('');
  return htmlTag;
}

/**
 *
 * @param {*} listing
 * @param {*} n
 * @returns
 */
const getFlightName = (site, listing, n = 0) => {
  let listingId = (typeof listing === "object" && listing !== null) ? listing.id : listing;
  let flightName = "N/A";

  $.ajax({
    dataType: "json",
    url: site + "/api/flights.json",
    data: "listing_id=" + listingId,
    async: false,
    success: (flights) => {
      if (flights.length) {
        flightName = flights[n].airline.name;
      }
    }
  });

  return flightName;
}