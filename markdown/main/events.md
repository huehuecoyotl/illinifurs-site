
[//]: # (pageid: events)
[//]: # (title: Upcoming Events)
[//]: # (author: @3xStan)
[//]: # (description: Learn more about upcoming IlliniFurs events.)
[//]: # (focus_image: https://illinifurs.com/images/namedLogo.png)
[//]: # (widgets: true)
[//]: # (tail_scripts: ["/js/illinifurs-collapsible.js", "/js/illinifurs-events.js"])

<% function getDayOfWeekStr(day) {
    switch (day) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
    }
    return "???";
} %>

<% function getShortMonthStr(month) {
    switch (month) {
        case 0:
            return "Jan";
        case 1:
            return "Feb";
        case 2:
            return "Mar";
        case 3:
            return "Apr";
        case 4:
            return "May";
        case 5:
            return "Jun";
        case 6:
            return "Jul";
        case 7:
            return "Aug";
        case 8:
            return "Sep";
        case 9:
            return "Oct";
        case 10:
            return "Nov";
        case 11:
            return "Dec";
    }
    return "???";
} %>

<% function getMonthStr(month) {
    switch (month) {
        case 0:
            return "January";
        case 1:
            return "February";
        case 2:
            return "March";
        case 3:
            return "April";
        case 4:
            return "May";
        case 5:
            return "June";
        case 6:
            return "July";
        case 7:
            return "August";
        case 8:
            return "September";
        case 9:
            return "October";
        case 10:
            return "November";
        case 11:
            return "December";
    }
    return "???";
} %>

<% function getDateStr(date) {
    return getDayOfWeekStr(date.getDay()) + ", " + getMonthStr(date.getMonth()) + " " + date.getDate();
} %>

<% function getTimeStr(time, depth, useAMPM) {
    hour = time.getHours() % 12;
    isAM = time.getHours() < 12;
    min = time.getMinutes();
    sec = time.getSeconds();
    if (hour === 0 && depth === 0) {
        if (isAM)
            return "Midnight";
        else
            return "Noon";
    }
    timeStr = "" + hour;
    timeStr = timeStr + (depth > 0 ? ":" + ("0" + min).slice(-2) : "");
    timeStr = timeStr + (depth > 1 ? ":" + ("0" + sec).slice(-2) : "");
    return timeStr + (useAMPM ? (isAM ? " AM" : " PM") : "");
} %>

<% function getTimestamp(event) {
    date = event['start'];
    dateData = [
        '' + date.getFullYear(),
        '0' + (date.getMonth() + 1),
        '0' + date.getDate(),
        '0' + date.getHours(),
        '0' + date.getMinutes(),
        '0' + date.getSeconds()
    ].map(component => component.slice(-2));
    dateData[0] = '' + date.getFullYear();
    return dateData.slice(0, 3).join('-') + 'T' + dateData.slice(3).join('');
} %>

<% function getDepth(time1, time2) {
    depth1 = (time1.getSeconds() === 0 ? (time1.getMinutes() === 0 ? 0 : 1) : 2);
    depth2 = (time2.getSeconds() === 0 ? (time2.getMinutes() === 0 ? 0 : 1) : 2);
    return (depth1 > depth2 ? depth1 : depth2);
} %>

<% function getDifferentMeridian(time1, time2) {
    meridian1 = time1.getHours() < 12;
    meridian2 = time2.getHours() < 12;
    retval = meridian1 !== meridian2;
    return (retval || time1.getHours() % 12 === 0 || time2.getHours() % 12 === 0);
} %>

<% function getWhen(event) {
    let start = event['start'];
    let end = event['end'];
    let now = Date.now();
    compareData = [
        start.getFullYear() == end.getFullYear(),
        start.getMonth() == end.getMonth(),
        start.getDate() == end.getDate(),
        start.getHours() == end.getHours(),
        start.getMinutes() == end.getMinutes(),
        start.getSeconds() == end.getSeconds()
    ];
    let i = 0;
    while (compareData[i])
        i++;
    depth = getDepth(start, end);
    startStr = "???";
    endStr = "???";
    if (i < 3) {
        if (event['allDay']) {
            startStr = getDateStr(start);
            endStr = getDateStr(end);
        } else {
            startStr = getDateStr(start) + ", " + getTimeStr(start, depth, true);
            endStr = getDateStr(end) + ", " + getTimeStr(end, depth, true);
        }
    } else {
        if (event['allDay']) {
            return getDateStr(start);
        }
        useAMPM = getDifferentMeridian(start, end);
        startStr = getDateStr(start) + ", " + getTimeStr(start, depth, useAMPM);
        endStr = getTimeStr(end, depth, true);
    }
    return startStr + " -- " + endStr;
} %>

<% function getFirstDayOfMonth(date) {
    currDay = date.getDay() + 7;
    currDate = date.getDate();
    while (currDate > 7)
        currDate = currDate - 7;
    return (currDay - (currDate - 1)) % 7;
} %>

<% function getLastDateOfMonth(date) {
    newDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return newDate.getDate();
} %>

<% function makeCalDisplay(event) {
    firstDayOfMonth = getFirstDayOfMonth(event['start']);
    lastDateOfMonth = getLastDateOfMonth(event['start']);
    throughMonthEnd = event['start'].getMonth() !== event['end'].getMonth(); %>
    <div class="calMonth">
        <h5><%= getShortMonthStr(event['start'].getMonth()) %></h5>
        <div class="calRow">
            <% i = 0;
            j = 1;
            while (i < firstDayOfMonth) { %>
                <div class='calEntry'><div class='missing'></div></div>
                <% i++;
            }
            while (j <= lastDateOfMonth) {
                if (i === 7) { %>
                    </div>
                    <div class="calRow">
                    <% i = 0;
                }
                if (j >= event['start'].getDate() && (throughMonthEnd || j <= event['end'].getDate())) { %>
                    <div class='calEntry'><div class='positive'></div></div>
                <% } else { %>
                    <div class='calEntry'><div class='negative'></div></div>
                <% }
                i++;
                j++;
            }
            while (i < 7) { %>
                <div class='calEntry'><div class='missing'></div></div>
                <% i++;
            } %>
        </div>
    </div>
<% } %> 

Click on an event to see more details! (All times are in Central time).

<div class="event-title-holder">
    <div class="title-spacer"></div>
    <% events.forEach(function(event){ %>
        <div class="card title-holder" data-id="<%= '#' + getTimestamp(event) %>">
            <div class="title-middle">
                <div class="container title-item">
                    <div class="title-card-spacer"></div>
                    <%- makeCalDisplay(event) %>
                    <div class="title-card-spacer"></div>
                    <div class="event-title"><%= event['name'] %></div>
                    <div class="title-card-spacer"></div>
                </div>
            </div>
        </div>
        <div class="title-spacer"></div>
    <% }) %>
</div>

<div id="details-holder">
    <% events.forEach(function(event){ %>
        <div class="event-detail" id="<%= getTimestamp(event) %>">
            <h2><%= event['name'] %></h2>
            <p>
                <b>Location:</b> <%= event['location'] %>
            </p>
            <p>
                <b>Time:</b> <%= getWhen(event) %>
            </p>
            <%- event['description'] %>
        </div>
    <% }) %>
</div>
