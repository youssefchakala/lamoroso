// "Open now" badge and today's hours, computed in Tunisia's time zone
// so the result is right whatever the visitor's own clock says.
(function () {
  var DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  var hours = JSON.parse(document.getElementById("hours-data").textContent);

  function tunisNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Tunis", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (type) { return parts.find(function (p) { return p.type === type; }).value; };
    return { day: get("weekday").toLowerCase().slice(0, 3), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
  }

  function toMinutes(hhmm) {
    var bits = hhmm.split(":");
    return Number(bits[0]) * 60 + Number(bits[1]);
  }

  function ranges(day) {
    return (hours[day] || "").split(",").filter(Boolean).map(function (part) {
      var bits = part.trim().split("-");
      return { start: toMinutes(bits[0]), end: toMinutes(bits[1]) };
    });
  }

  function isOpen(now) {
    var today = DAYS.indexOf(now.day);
    var yesterday = DAYS[(today + 6) % 7];
    var openToday = ranges(now.day).some(function (r) {
      return r.end > r.start ? now.minutes >= r.start && now.minutes < r.end : now.minutes >= r.start;
    });
    // A range like 18:00-01:00 that started yesterday is still running after midnight.
    var openFromYesterday = ranges(yesterday).some(function (r) {
      return r.end <= r.start && now.minutes < r.end;
    });
    return openToday || openFromYesterday;
  }

  var now = tunisNow();
  var status = document.querySelector("[data-status]");
  if (status) {
    var open = isOpen(now);
    status.textContent = open ? "Ouvert maintenant" : "Fermé actuellement";
    status.classList.add(open ? "is-open" : "is-closed");
  }

  var todayHours = document.querySelector("[data-today-hours]");
  if (todayHours) {
    var value = hours[now.day];
    todayHours.textContent = value
      ? value.split(",").map(function (p) { return p.trim().replace("-", " – "); }).join(" · ")
      : "Fermé";
  }

  var row = document.querySelector('.hours tr[data-day="' + now.day + '"]');
  if (row) row.classList.add("is-today");

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
