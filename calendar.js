/*!
 * Calendar v1.2 - Javascript Calendar plugin for Schedule Applications
 * Copyright 2022 Silvio Delgado (https://github.com/silviodelgado)
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 * Dependencies: moment.js & Bootstrap 5+
 * https://github.com/silviodelgado/Calendar
*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory(root));
    } else {
        root.Calendar = factory(root);
    }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {
    'use strict';

    let $moment = moment();
    let weeks = 0;
    let options = {};

    const defaultValues = {
        container: '#calendar',
        dates: [],
        date: moment().date(1),
        language: 'en',
        previousBtn: {
            text: 'Prev',
            class: ['btn-primary']
        },
        nextBtn: {
            text: 'Next',
            class: ['btn-primary']
        },
        todayBtn: {
            text: 'Today',
            class: ['btn-outline-primary']
        }
    };

    const calendar = function (params) {
        options = Object.assign(defaultValues, params);
        $moment.locale(options.language);
        options.date = $moment.date(1);
        render_component();
        return calendar;
    };

    const weeks_in_month = () => {
        let first = moment(options.date).date(1);
        let last = moment(first).date(first.daysInMonth());
        let add = 1;
        if (last.week() == 1) add++; // bugfix
        while (last.week() == 1) last.add(-1, 'days'); // bugfix
        return last.week() - first.week() + add;
    };

    const mount_days = () => {
        let work_date = moment(options.date);
        let days = [];

        for (var i = 0; i < weeks; i++) {
            for (var j = 0; j < 7; j++) {
                let day = work_date.format('D');
                if (work_date.format('d') == j) {
                    if (!days.includes(day)) {
                        days.push(day);
                    }
                    if (day <= work_date.daysInMonth()) {
                        work_date.add(1, 'days');
                    }
                    continue;
                }
                days.push(null);
            }
        }
        return days;
    };

    const create_elem = (tagName, attributes, classList) => {
        let attrs = attributes || [];
        let classes = classList || [];
        let element = document.createElement(tagName);
        attrs.forEach((item, i) => {
            element.setAttribute(item[0], item[1]);
        });
        if (Array.isArray(classes)) {
            classes.forEach((item, i) => {
                element.classList.add(item);
            });
        } else if (typeof classes == 'string') {
            element.classList.add(classes);
        }
        return element;
    };

    const dispatch_event = (eventName, data) => {
        let event = new CustomEvent(eventName);
        if (data) {
            event.data = data;
        }
        document.querySelector(options.container).dispatchEvent(event);
    };

    const render_header = (container) => {
        let header = create_elem('div', null, ['calendar-header', 'row']);

        let col1 = create_elem('div', null, ['col-sm-6', 'text-start'])
        let h3 = create_elem('h3');
        h3.innerHTML = options.date.format('MMMM YYYY');
        col1.appendChild(h3);
        header.appendChild(col1);

        let col2 = create_elem('div', null, ['col-sm-6', 'text-end'])
        render_buttons(col2);
        header.appendChild(col2);

        container.appendChild(header);
    };

    const render_buttons = (container) => {
        let group = create_elem('div', [['role', 'group']], 'btn-group');
        let previous = create_elem('button', [
            ['type', 'button']
        ], ['navigation', 'previous-month', 'btn', 'btn-sm'].concat(options.previousBtn.class));
        previous.innerHTML = options.previousBtn.text;
        group.appendChild(previous);

        let today = create_elem('button', [
            ['type', 'button']
        ], ['navigation', 'today', 'btn', 'btn-sm'].concat(options.todayBtn.class));
        today.innerHTML = options.todayBtn.text;
        group.appendChild(today);

        let next = create_elem('button', [
            ['type', 'button']
        ], ['navigation', 'next-month', 'btn', 'btn-sm'].concat(options.nextBtn.class));
        next.innerHTML = options.nextBtn.text;
        group.appendChild(next);

        container.appendChild(group);
    };

    const render_calendar_header = (container) => {
        let work_date = moment([2020, 2, 1]); // 01/mar/2020 - sunday
        work_date.locale(options.language);

        let header = create_elem('thead');
        let tr = document.createElement('tr');
        let cell = document.createElement('th');

        cell.innerText = work_date.format('dddd');
        tr.appendChild(cell.cloneNode(true));
        cell.innerText = work_date.add(1, 'days').format('dddd');
        tr.appendChild(cell.cloneNode(true));
        cell.innerText = work_date.add(1, 'days').format('dddd');
        tr.appendChild(cell.cloneNode(true));
        cell.innerText = work_date.add(1, 'days').format('dddd');
        tr.appendChild(cell.cloneNode(true));
        cell.innerText = work_date.add(1, 'days').format('dddd');
        tr.appendChild(cell.cloneNode(true));
        cell.innerText = work_date.add(1, 'days').format('dddd');
        tr.appendChild(cell.cloneNode(true));
        cell.innerText = work_date.add(1, 'days').format('dddd');
        tr.appendChild(cell.cloneNode(true));

        header.appendChild(tr);
        container.appendChild(header);
    };

    const render_calendar_body = (container) => {
        let days = mount_days();
        let body = document.createElement('tbody');
        let control = 0;
        let dt = moment(options.date).subtract(1, 'days');
        for (var i = 0; i < weeks; i++) {
            let work_row = document.createElement('tr');
            for (var j = 0; j < 7; j++) {
                let td = document.createElement('td');
                if (days[control]) {
                    dt.add(1, 'days');
                    let dateStr = dt.format('YYYY-MM-DD');
                    let span = document.createElement('span');
                    span.innerText = days[control];
                    if (days[control] == moment().format('D') && dt.format('MM') == moment().format('MM')) {
                        td.classList.add('today');
                    }
                    td.dataset.dt = dateStr;
                    td.appendChild(span);
                    let dates = options.dates.filter((el) => {
                        return el.date == dateStr;
                    }).sort((elem, compare) => {
                        if (elem.time < compare.time) {
                            return -1;
                        }
                        if (elem.time > compare.time) {
                            return 1;
                        }
                        return 0;
                    });
                    dates.forEach((el, i) => {
                        let content = el.time + ' - ' + el.title;
                        let div = create_elem('div', [['title', content]], ['event', el.type]);
                        let span = create_elem('span');
                        let html = '<span>';
                        if (el.done) {
                            html += '<b class="done">&check;</b>';
                        }
                        html += content + '</span>';
                        span.innerHTML = html;
                        div.appendChild(span);
                        div.addEventListener('click', (evt) => {
                            evt.preventDefault();
                            dispatch_event('calendar.date.select', { 
                                id: el.id,
                                date: el.date,
                                time: el.time
                            });
                            return false;
                        });
                        td.append(div);
                    });
                }
                work_row.appendChild(td);
                control++;
            }
            body.appendChild(work_row);
        }
        container.appendChild(body);
    };

    const render_calendar = (container) => {
        let table = document.createElement('table');
        table.classList.add('table', 'table-sm');

        render_calendar_header(table);
        weeks = weeks_in_month();
        render_calendar_body(table);
        container.appendChild(table);

        let width = document.querySelector('.calendar .table').offsetWidth;
        Array.from(document.querySelectorAll('.calendar .table tbody td .event')).forEach((el, i) => {
            el.style.width = ((width / 7) - 10) + 'px';
        });
    };

    const render_component = () => {
        let container = document.querySelector(options.container);
        container.innerHTML = '';
        container.classList.add('calendar');

        render_header(container);
        render_calendar(container);
        init_controls();
    };

    calendar.next = () => {
        options.date.add(-1, 'month');
        render_component();
        dispatch_event('calendar.month.change');
    };
    
    calendar.previous = () => {
        options.date.add(1, 'month');
        render_component();
        dispatch_event('calendar.month.change');
    };
    
    calendar.today = () => {
        options.date = moment().lang(options.language).date(1);
        render_component();
        dispatch_event('calendar.month.change');
    };
    
    calendar.refresh = () => {
        render_component();
        dispatch_event('calendar.refresh');
    };
    
    calendar.setDates = (dates) => {
        options.dates = dates;
        render_component();
        dispatch_event('calendar.update');
    };

    calendar.remove = (id) => {
        options.dates = options.dates.filter((el) => {
            return el.id != id;
        });
        render_component();
        dispatch_event('calendar.update');
    };

    calendar.add = (item) => {
        options.dates.push(item);
        render_component();
        dispatch_event('calendar.update');
    };

    calendar.done = (id) => {
        options.dates.forEach((item, i) => {
            if (item.id == id) {
                item.done = true;
            }
        });
        render_component();
        dispatch_event('calendar.update');
    };

    calendar.undone = (id) => {
        options.dates.forEach((item, i) => {
            if (item.id == id) {
                item.done = false;
            }
        });
        render_component();
        dispatch_event('calendar.update');
    };

    const init_controls = () => {
        let previous = document.querySelector('.calendar .navigation.previous-month');
        previous.addEventListener('click', (evt) => {
            evt.preventDefault();
            calendar.next();
            return false;
        });

        let next = document.querySelector('.calendar .navigation.next-month');
        next.addEventListener('click', (evt) => {
            evt.preventDefault();
            calendar.previous();
            return false;
        });

        let today = document.querySelector('.calendar .navigation.today');
        today.addEventListener('click', (evt) => {
            evt.preventDefault();
            calendar.today();
            return false;
        });
    };

    return calendar;
});
