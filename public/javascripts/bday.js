// page level variables
var global_list = new Array();
var month_list = new Array();
var relationship_list = new Array();
var color_list = new Array();
const month_names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var notification_settings = new Object();

// functions to set page level variables
function set_globals(birthdays) {
    global_list = birthdays;
    month_list = Array.from(new Set(birthdays.map(birthday => birthday["month"])));
    relationship_list = Array.from(new Set(birthdays.map(birthday => birthday["relationship"].toLowerCase())));
    color_list = Array.from(new Set(birthdays.map(birthday => birthday["color"].split("|")[0])));
    notification_settings = 
    populate_filters();
}

// functions to consume APIs
function fetch_birthdays() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var birthdays = JSON.parse(xmlhttp.responseText);
            set_globals(birthdays);
            generate_view(birthdays, "month");
        }
    }
    // TODO URL ???
    xmlhttp.open("GET", "http://127.0.0.1:5000/birthday/list", true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    // TODO set header from session
    xmlhttp.setRequestHeader('username', 'arjun');
    xmlhttp.setRequestHeader('uid', 1);
    xmlhttp.send();
}

function add_new_birthday(add) {
    if (Number(uid) < 0) {
        console.log('not logged in');
        // not logged in
        // alert("please log in");
        // return;
    }

    // validate form inputs
    var nameElement = document.getElementById("bday-name");
    var relationshipElement = document.getElementById("bday-relationship");
    var yearElement = document.getElementById("bday-year");
    var monthElement = document.getElementById("bday-month");
    var dayElement = document.getElementById("bday-day");
    var notesElement = document.getElementById("bday-notes");
    var remindersElement = document.getElementById("rem-list");
    var bgElement = document.getElementById("bday-bg");
    var txtElement = document.getElementById("bday-txt");

    if(!nameElement.checkValidity()) {
        alert("please input name");
        return;
    }

    if(!yearElement.checkValidity()) {
        alert("please input valid year");
        return;
    }

    if(!monthElement.checkValidity()) {
        alert("please select month");
        return;
    }

    if(!dayElement.checkValidity()) {
        alert("please input valid day");
        return;
    }

    if(monthElement.value === "2" && dayElement.value === "31") {
        alert("I said please :(");
        return;
    }

    // build request body from form elements
    var request = {};
    request["name"] = nameElement.value;
    request["relationship"] = relationshipElement.value;
    request["year"] = yearElement.value ? Number(yearElement.value) : 0;
    request["month"] = Number(monthElement.value);
    request["day"] = Number(dayElement.value);
    request["notes"] = notesElement.value;
    request["reminders"] = [...remindersElement.children].map(remElement => {
        return remElement.id.split('-')[1];
    }).join("|");    
    request["wishes"] = ''; // add feature later
    request["color"] = bgElement.value + "|" + txtElement.value;
    if(!add) {
        request["eid"] = document.getElementById("bday-eid").innerHTML;
    }    

    // build and send XMLHttpRequest
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (xmlhttp.responseText === "success") {
                alert(add ? 'added new birthday and scheduled reminder(s)' : 'updated birthday and reminders');
                set_hidden('bday-modal', true);
                clear_form();
                reload_view();            
            }
        }
    }
    // TODO URL???
    var url = add ? "http://127.0.0.1:5000/birthday/add" : "http://127.0.0.1:5000/birthday/update";
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    // TODO set header from session
    xmlhttp.setRequestHeader('username', 'arjun');
    xmlhttp.setRequestHeader('uid', 1);
    xmlhttp.send(JSON.stringify(request));
}

function delete_birthday(eid) {
    if (Number(uid) < 0) {
        console.log('not logged in');
        // not logged in
        // alert("please log in");
        // return;
    }

    // build request body
    var request = {};
    request["eid"] = eid;    

    // build and send XMLHttpRequest
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (xmlhttp.responseText === "success") {
                alert('deleted birthday and reminders');
                reload_view();           
            }
        }
    }
    // TODO URL???
    var url = "http://127.0.0.1:5000/birthday/delete";
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    // TODO set header from session
    xmlhttp.setRequestHeader('username', 'arjun');
    xmlhttp.setRequestHeader('uid', 1);
    xmlhttp.send(JSON.stringify(request));
}

function check_telegram_enabled() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        set_hidden("telegram-register-modal", true);
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.getElementById("telegram-enabled").innerHTML = 'Yes';
            document.getElementById("telegram-register-button").hidden = true;
            document.getElementById("telegram-test-button").hidden = false;    
            document.getElementById("telegram-deregister-button").hidden = false;        
        } else if (xmlhttp.readyState == 4 && xmlhttp.status != 200) {
            document.getElementById("telegram-enabled").innerHTML = 'No';    
            document.getElementById("telegram-register-button").hidden = false;
            document.getElementById("telegram-test-button").hidden = true;   
            document.getElementById("telegram-deregister-button").hidden = true; 
        }
    }

    // TODO set header from session    
    xmlhttp.open("GET", url + "telegram/fetch", true);
    xmlhttp.setRequestHeader('username', 'arjun');
    xmlhttp.setRequestHeader('uid', 1);
    xmlhttp.send();
}

function test_telegram_notification() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            alert('check your phone ..')
        } else if (xmlhttp.readyState == 4 && xmlhttp.status != 200) {
            alert('error, please try later ..');
        }
    }

    // TODO set header from session    
    xmlhttp.open("GET", url + "telegram/test", true);
    xmlhttp.setRequestHeader('username', 'arjun');
    xmlhttp.setRequestHeader('uid', 1);
    xmlhttp.send();
}

function register_telegram() {

    var otp_input_element = document.getElementById("telegram-otp");
    var otp = otp_input_element.value;

    if(!otp_input_element.checkValidity() || otp === "" || otp === undefined) {
        alert('invalid OTP');
        return;
    }
    
    var otp = otp_input_element.value;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            alert(xmlhttp.responseText);
            check_telegram_enabled();

        } else if (xmlhttp.readyState == 4 && xmlhttp.status != 200) {
            alert(xmlhttp.responseText);
        }
    }

    var body = {"otp": otp};

    // TODO set header from session    
    xmlhttp.open("POST", url + "telegram/register", true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.setRequestHeader('username', 'arjun');
    xmlhttp.setRequestHeader('uid', 1);
    xmlhttp.send(JSON.stringify(body));
}

function deregister_telegram() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            alert(xmlhttp.responseText);
            check_telegram_enabled();

        } else if (xmlhttp.readyState == 4 && xmlhttp.status != 200) {
            alert(xmlhttp.responseText);
        }
    }

    // TODO set header from session    
    xmlhttp.open("GET", url + "telegram/deregister", true);
    xmlhttp.setRequestHeader('username', 'arjun');
    xmlhttp.setRequestHeader('uid', 1);
    xmlhttp.send();
}

// functions to generate HTML elements
function option_element(text) {
    var option = document.createElement("option");
    option.value = "";
    option.innerHTML = text;
    return option;
}

function br_element() {
    return document.createElement("br");
}

function text_span(text) {
    var element = document.createElement("span");
    element.innerHTML = text;
    return element;
}

function text_div(text) {
    var element = document.createElement("div");
    element.innerHTML = text;
    return element;
}

function text_div_with_id(text, id) {
    var element = document.createElement("div");
    element.innerHTML = text;
    element.id = id;
    return element;
}

function delete_element(elementId) {
    var deleteSpan = document.createElement("span");
    deleteSpan.style = "font-size: large; color: red; cursor: pointer;";
    deleteSpan.innerHTML = "&nbsp;X";
    deleteSpan.onclick = () => {
        document.getElementById(elementId).remove();
    };
    return deleteSpan;
}

function populate_filters() {        
    var month_select_element = document.getElementById('month-filter');
    month_select_element.innerHTML = "";    
    month_select_element.appendChild(option_element("Month"));
    month_list.forEach(month => {
        var option_element = document.createElement("option");
        option_element.value = month;
        option_element.innerHTML = month_names[month - 1];
        month_select_element.appendChild(option_element);
    });

    var relationship_select_element = document.getElementById('relationship-filter');
    relationship_select_element.innerHTML = "";
    relationship_select_element.appendChild(option_element("Relationship"));
    relationship_list.forEach(relationship_name => {
        var option_element = document.createElement("option");
        option_element.value = relationship_name;
        option_element.innerHTML = relationship_name;
        relationship_select_element.appendChild(option_element);
    });

    var color_select_element = document.getElementById('color-filter');
    color_select_element.innerHTML = "";    
    color_select_element.appendChild(option_element("Background Color"));
    color_list.forEach(color_name => {
        var option_element = document.createElement("option");
        option_element.value = color_name;
        option_element.innerHTML = color_name;
        option_element.style.color = color_name;
        option_element.style.backgroundColor = color_name;
        color_select_element.appendChild(option_element);
    });
}

function clear_view() {
    document.getElementById("bday-list-container").innerHTML = '';
}

function reload_view() {
    clear_view();
    fetch_birthdays();
    check_telegram_enabled();
}

function generate_view(birthdays, sortCriteria) {

    var sortedBirthdaysMap = new Map();    

    if(sortCriteria === "today") {
        var today = new Date();
        var filtered_birthdays_list = birthdays.filter(birthday => {              
            return birthday["month"] == today.getMonth() + 1 && birthday["day"] == today.getDate();
        });
        if(filtered_birthdays_list.length > 0) {
            filtered_birthdays_list.sort((a, b) => {
                var a_date = String(a['month']).length === 2 ? String(a['month']) : "0" + String(a['month']) + String(a['day']).length === 2 ? String(a['day']) : "0" + String(a['day']);
                var b_date = String(b['month']).length === 2 ? String(b['month']) : "0" + String(b['month']) + String(b['day']).length === 2 ? String(b['day']) : "0" + String(b['day']);
                return a_date - b_date;
            });
            sortedBirthdaysMap.set(month_names[today.getMonth()] + ' ' + today.getDate(), filtered_birthdays_list);
        }        
    } else if(sortCriteria === "month") {
        month_names.forEach((month_name, index) => {
            var filtered_birthdays_list = birthdays.filter(birthday => birthday["month"] === index + 1);
            filtered_birthdays_list.sort((a, b) => {
                var a_day = String(a['day']).length === 2 ? String(a['day']) : "0" + String(a['day']);
                var b_day = String(b['day']).length === 2 ? String(b['day']) : "0" + String(b['day']);
                return a_day - b_day;
            });
            sortedBirthdaysMap.set(month_name, filtered_birthdays_list);
        });
    } else if (sortCriteria === "relationship") {
        var relationships = Array.from(new Set(birthdays.map(birthday => birthday["relationship"].toLowerCase())));
        relationships.forEach(relationship_name => {
            var filtered_birthdays_list = birthdays.filter(birthday => birthday["relationship"].toLowerCase() === relationship_name);
            filtered_birthdays_list.sort((a, b) => {
                var a_date = String(a['month']).length === 2 ? String(a['month']) : "0" + String(a['month']) + String(a['day']).length === 2 ? String(a['day']) : "0" + String(a['day']);
                var b_date = String(b['month']).length === 2 ? String(b['month']) : "0" + String(b['month']) + String(b['day']).length === 2 ? String(b['day']) : "0" + String(b['day']);
                return a_date - b_date;
            });
            sortedBirthdaysMap.set(relationship_name, filtered_birthdays_list);
        });
    } else if (sortCriteria === "color") {
        var colors = Array.from(new Set(birthdays.map(birthday => birthday["color"].split("|")[0])));
        colors.forEach(color_hex_code => {
            var filtered_birthdays_list = birthdays.filter(birthday => birthday["color"].split("|")[0] === color_hex_code);
            filtered_birthdays_list.sort((a, b) => {
                var a_date = String(a['month']).length === 2 ? String(a['month']) : "0" + String(a['month']) + String(a['day']).length === 2 ? String(a['day']) : "0" + String(a['day']);
                var b_date = String(b['month']).length === 2 ? String(b['month']) : "0" + String(b['month']) + String(b['day']).length === 2 ? String(b['day']) : "0" + String(b['day']);
                return a_date - b_date;
            });
            sortedBirthdaysMap.set(color_hex_code, filtered_birthdays_list);
        });
    }

    var card_index = 0;
    var list_container_element = document.getElementById("bday-list-container");    
    if(sortCriteria === "today" && sortedBirthdaysMap.size === 0) {
        var today = new Date();
        list_container_element.appendChild(text_div(month_names[today.getMonth()] + ' ' + today.getDate() + ": no birthdays today"));
    } else {
        sortedBirthdaysMap.forEach((value, key) => {  
            if(value.length === 0) return;
            var title_div = text_div(key + ":");
            if(sortCriteria === "color") {
                title_div.style.backgroundColor = key;
                title_div.style.color = key;
            }
            list_container_element.appendChild(title_div);
            var list_element = document.createElement("div");
            list_element.id = "bday-list-" + key;
            list_element.className = "bday-list";
            value.forEach(birthday => {
                list_element.appendChild(build_view_item(birthday, card_index++));
            });
            list_container_element.appendChild(list_element);
        });
        if(list_container_element.innerHTML === "") {
            list_container_element.appendChild(text_div("no birthdays"));
        }
    }        
}

function build_view_item(birthday, index) { 
    var bkgColor = birthday['color'].split("|")[0];
    var txtColor = birthday['color'].split("|")[1];


    var viewItemDiv = document.createElement("div");
    viewItemDiv.id = 'bday-list-item-' + (index + 1);
    viewItemDiv.className = "bday-list-item";
    viewItemDiv.style.backgroundColor = bkgColor;
    viewItemDiv.style.color = txtColor;    

    var day = birthday['day'];
    var month = birthday['month'];
    var year = birthday['year'];
    var dateDiv = document.createElement("div");
    dateDiv.className = "list-item-date";
    dateDiv.innerHTML = month_names[month-1] + ' ' + day + (year === 0 ? '' : ', ' + year);

    var nameDiv = document.createElement("div");
    nameDiv.className = "list-item-name";
    nameDiv.innerHTML = birthday['name'];

    var relationshipDiv = document.createElement("div");
    relationshipDiv.className = "list-item-relationship";
    relationshipDiv.innerHTML = birthday['relationship'];

    var remindersFrontDiv = document.createElement("div");
    remindersFrontDiv.className = "list-item-reminder";
    remindersFrontDiv.innerHTML = birthday['reminders'].split('|').length + " reminder(s)";

    var viewItemFrontDiv = document.createElement("div");
    viewItemFrontDiv.id = 'list-item-front-' + (index + 1);
    viewItemFrontDiv.className = "list-item-front";
    viewItemFrontDiv.addEventListener("click", () => {
        flip_card(index);
    });
    viewItemFrontDiv.appendChild(dateDiv);
    viewItemFrontDiv.appendChild(nameDiv);
    viewItemFrontDiv.appendChild(relationshipDiv);
    viewItemFrontDiv.appendChild(remindersFrontDiv);

    var notes = birthday['notes'];
    notes = notes.length > 0 ? 'notes: ' + notes : 'no notes';
    var notesDiv = document.createElement("div");
    notesDiv.className = "list-item-back-note";
    notesDiv.innerHTML = notes;
    notesDiv.style.borderColor = txtColor;

    var reminderMessages = birthday['reminders'].split('|').map(rem => {        
        if(rem === "DEFAULT") {
            return text_div("> on birthday");
        } else {
            return text_div("> " + rem.slice(0, -1) + " day(s) before birthday");
        }
    });
    var remindersBackDiv = document.createElement("div");
    remindersBackDiv.className = "list-item-back-reminder";
    remindersBackDiv.appendChild(text_div("reminders:"));
    reminderMessages.forEach(rem => {
        remindersBackDiv.appendChild(rem);
    });
    remindersBackDiv.style.borderColor = txtColor;

    var updateButton = document.createElement("input");
    updateButton.type = "button";
    updateButton.value = "update";
    updateButton.className = "list-item-back-update";
    updateButton.style.backgroundColor = txtColor;
    updateButton.style.color = bkgColor;
    updateButton.addEventListener("click", () => {
        // update birthday
        toggle_hidden('bday-modal');
        set_form(birthday);
    });

    var deleteButton = document.createElement("input");
    deleteButton.type = "button";
    deleteButton.value = "delete";
    deleteButton.className = "list-item-back-delete";
    deleteButton.style.backgroundColor = txtColor;
    deleteButton.style.color = bkgColor;
    deleteButton.addEventListener("click", () => {
        // delete birthday
        if(confirm('are you sure you want to delete birthday and reminders?')) {
            delete_birthday(birthday["eid"]);
        }        
    });

    var viewItemBackDiv = document.createElement("div");
    viewItemBackDiv.id = 'list-item-back-' + (index + 1);
    viewItemBackDiv.className = "list-item-back";
    viewItemBackDiv.hidden = true;
    viewItemBackDiv.addEventListener("click", () => {
        flip_card(index);
    });
    viewItemBackDiv.appendChild(notesDiv);
    viewItemBackDiv.appendChild(remindersBackDiv);
    viewItemBackDiv.appendChild(updateButton);
    viewItemBackDiv.appendChild(deleteButton);

    viewItemDiv.appendChild(viewItemFrontDiv);
    viewItemDiv.appendChild(viewItemBackDiv);
    return viewItemDiv;
}

function flip_card(itemIndex) {
    var element = document.getElementsByClassName('bday-list-item')[itemIndex];
    var orientation = element.style.transform;
    if (orientation == "rotateY(180deg)") {
        element.style.transform = "rotateY(0deg)";
        element.getElementsByClassName("list-item-front")[0].hidden = false;
        element.getElementsByClassName("list-item-back")[0].hidden = true;
    } else {
        element.style.transform = "rotateY(180deg)";
        element.getElementsByClassName("list-item-front")[0].hidden = true;
        element.getElementsByClassName("list-item-back")[0].hidden = false;
    }
}

function clear_reminders_list() {
    document.getElementById("rem-list").innerHTML = `<div id="rem-DEFAULT">default (on birthday)</div>`;
}

function set_reminders_list(reminders) {  
    document.getElementById("rem-list").innerHTML = '';      
    reminders.forEach(reminder => {
        if(reminder === "DEFAULT") {
            document.getElementById("rem-list").appendChild(text_div_with_id("default (on birthday)", "rem-DEFAULT"));
        } else {
            var days = reminder.slice(0, -1);
            var message = days + (Number(days) > 1 ? " days" : " day") + " before";
            var id = "rem-" + String(days) + "D";
            var remItem = text_div_with_id(message, id);
            remItem.appendChild(delete_element(id));
            document.getElementById("rem-list").appendChild(remItem);
        }        
    });
}

function clear_form() {
    document.getElementById('bday-eid').innerHTML = '';
    document.getElementById("bday-name").value = '';
    document.getElementById("bday-relationship").value = '';
    document.getElementById("bday-year").value = '';
    document.getElementById("bday-month").value = '0';
    document.getElementById("bday-day").value = '';
    document.getElementById("bday-notes").value = '';
    document.getElementById("bday-bg").value = '#000000';
    document.getElementById("bday-txt").value = '#ffffff';
    document.getElementById("bday-color-output").style.backgroundColor = '#000000';
    document.getElementById("bday-color-output").style.color = '#ffffff';
    clear_reminders_list();
    set_hidden("form-new-rem-div", true);   
    document.getElementById('bday-modal-legend').innerHTML = 'Add Birthday: ';

    var old_element = document.getElementById("bday-add-new-submit-button");
    var new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);
    document.getElementById("bday-add-new-submit-button").addEventListener("click", () => {
        add_new_birthday(true);
    });
}

function set_form(birthday) {
    document.getElementById('bday-eid').innerHTML = birthday["eid"];
    document.getElementById("bday-name").value = birthday["name"];
    document.getElementById("bday-relationship").value = birthday["relationship"];
    document.getElementById("bday-year").value = birthday["year"];
    document.getElementById("bday-month").value = birthday["month"];
    document.getElementById("bday-day").value = birthday["day"];
    document.getElementById("bday-notes").value = birthday["notes"];
    document.getElementById("bday-bg").value = birthday["color"].split('|')[0];
    document.getElementById("bday-txt").value = birthday["color"].split('|')[1];
    document.getElementById("bday-color-output").style.backgroundColor = birthday["color"].split('|')[0];
    document.getElementById("bday-color-output").style.color = birthday["color"].split('|')[1];
    set_reminders_list(birthday["reminders"].split('|'));
    set_hidden("form-new-rem-div", true);  
    document.getElementById('bday-modal-legend').innerHTML = 'Update Birthday: ';    
    
    var old_element = document.getElementById("bday-add-new-submit-button");
    var new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);
    document.getElementById("bday-add-new-submit-button").addEventListener("click", () => {
        add_new_birthday(false);
    });
}

function reset_new_reminders_form() {
    document.getElementById("rem-days").value = '';
}

function function_apply_filter() {
    clear_view();
    var filtered_list = global_list;            

    var month_filter = document.getElementById("month-filter").value;            
    filtered_list = month_filter !== "" ? filtered_list.filter(birthday => birthday["month"] == month_filter) : filtered_list;                                 

    var relationship_filter = document.getElementById("relationship-filter").value;            
    filtered_list = relationship_filter !== "" ? filtered_list.filter(birthday => birthday["relationship"].toLowerCase() == relationship_filter) : filtered_list;            

    var color_filter = document.getElementById("color-filter").value;            
    filtered_list = color_filter !== "" ? filtered_list.filter(birthday => birthday["color"].split('|')[0] == color_filter) : filtered_list;                    

    if(document.getElementById("today-button").value === "all") {
        document.getElementById("today-button").value = "today";
    }

    generate_view(filtered_list, document.getElementById("sort-options").value);
}

window.addEventListener('load', () => {    
    reload_view();

    if (document.getElementById("bday-add-new-button")) {
        document.getElementById("bday-add-new-button").addEventListener("click", () => {
            toggle_hidden('bday-modal');
            clear_form();
        });
    }

    if (document.getElementById("bday-add-new-cancel-button")) {
        document.getElementById("bday-add-new-cancel-button").addEventListener("click", () => {
            set_hidden('bday-modal', true);
            clear_form();
        });
    }

    if (document.getElementById("bday-add-new-submit-button")) {
        document.getElementById("bday-add-new-submit-button").addEventListener("click", () => {
            add_new_birthday(true);
        });
    }    

    if (document.getElementById("form-new-rem")) {
        document.getElementById("form-new-rem").addEventListener("click", () => {
            set_hidden("form-new-rem-div", false);
            reset_new_reminders_form();
        });
    }

    if (document.getElementById("form-cancel-new-rem")) {
        document.getElementById("form-cancel-new-rem").addEventListener("click", () => {
            set_hidden("form-new-rem-div", true);
            reset_new_reminders_form();
        });
    }

    if (document.getElementById("form-add-new-rem")) {
        document.getElementById("form-add-new-rem").addEventListener("click", () => {
            var inputElement = document.getElementById("rem-days");
            if (!inputElement.checkValidity()) {
                alert('please input a valid number');
                return;
            }
            var days = inputElement.value;
            var id = "rem-" + String(days) + "D";

            var listItem = document.createElement("div");
            listItem.id = id;
            listItem.innerHTML = days + (Number(days) > 1 ? " days" : " day") + " before";
            listItem.appendChild(delete_element(id));
            document.getElementById("rem-list").appendChild(listItem);

            set_hidden("form-new-rem-div", true);
            reset_new_reminders_form();
        });
    }       

    if (document.getElementById("bday-bg")) {
        document.getElementById("bday-bg").addEventListener("change", (event) => {
            document.getElementById("bday-color-output").style.backgroundColor = event.target.value;
        });
    }

    if (document.getElementById("bday-txt")) {
        document.getElementById("bday-txt").addEventListener("change", (event) => {
            document.getElementById("bday-color-output").style.color = event.target.value;
        });
    }

    if (document.getElementById("list-item-front")) {
        document.getElementById("list-item-front").addEventListener("click", () => {
            flip_card(0);
        });
    }

    if (document.getElementById("list-item-back")) {
        document.getElementById("list-item-back").addEventListener("click", () => {
            flip_card(0);
        });
    }    

    if (document.getElementById("today-button")) {
        document.getElementById("today-button").addEventListener("click", () => {
            clear_view();                        
            var this_element = document.getElementById("today-button");
            if(this_element.value === "today") {
                this_element.value = "all";
                generate_view(global_list, "today");
            } else {
                this_element.value = "today";
                generate_view(global_list, "month");
                document.getElementById("sort-options").value = "month";
            }
        });
    }

    if (document.getElementById("sort-options")) {
        document.getElementById("sort-options").addEventListener("change", (event) => {
            clear_view();            
            function_apply_filter();
        });
    }

    if (document.getElementById("apply-filter-button")) {
        document.getElementById("apply-filter-button").addEventListener("click", function_apply_filter);
    }

    if (document.getElementById("clear-filter-button")) {
        document.getElementById("clear-filter-button").addEventListener("click", (event) => {
            clear_view();
            document.getElementById("month-filter").value = "";
            document.getElementById("relationship-filter").value = "";
            document.getElementById("color-filter").value = "";       
            if(document.getElementById("today-button").value === "all") {
                document.getElementById("today-button").value = "today";
            }  
            document.getElementById("sort-options").value = "month";
            generate_view(global_list, "month");
        });
    }

    if (document.getElementById("telegram-test-button")) {
        document.getElementById("telegram-test-button").addEventListener("click", (event) => {
            test_telegram_notification();
        });
    }

    if (document.getElementById("telegram-register-button")) {
        document.getElementById("telegram-register-button").addEventListener("click", (event) => {
            toggle_hidden('telegram-register-modal');
        });
    }

    if (document.getElementById("telegram-deregister-button")) {
        document.getElementById("telegram-deregister-button").addEventListener("click", (event) => {
            var agree = confirm('You will stop receiving Reminders on Telegram. Are you sure?');
            if(agree) {
                deregister_telegram();
            }
        });
    }

    if (document.getElementById("register-submit-button")) {
        document.getElementById("register-submit-button").addEventListener("click", (event) => {
            register_telegram();
        });
    }

    if (document.getElementById("register-cancel-button")) {
        document.getElementById("register-cancel-button").addEventListener("click", (event) => {
            toggle_hidden('telegram-register-modal');
        });
    }
});