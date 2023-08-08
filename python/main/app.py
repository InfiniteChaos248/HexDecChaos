from flask import Flask, request, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.triggers.date import DateTrigger
from datetime import datetime, timedelta
import sqlite3
import json
import config

app = Flask(__name__)
CORS(app)

jobstores = {
    'default': SQLAlchemyJobStore(url=config.JOBSTORE_URL)
}

scheduler = BackgroundScheduler(jobstores=jobstores)

@app.route('/')
def server_health():
   return "Flask server is up :)"

@app.route('/scheduler')
def scheduler_status():
    scheduler.print_jobs()   
    if scheduler.state == 0:
        return 'scheduler is stopped'
    if scheduler.state == 1:
        return 'scheduler is running'
    if scheduler.state == 2:
        return 'scheduler is paused'    

@app.route('/birthday/add', methods=['POST'])   
def add_birthday_event_controller():
    event_data = request.json
    event_data['uid'] = request.headers['uid']
    event_data['username'] = request.headers['username']
    print("request = " + str(event_data))
    add_birthday_event(event_data)
    return 'success'

@app.route('/birthday/update', methods=['POST'])   
def update_birthday_event_controller():
    event_data = request.json
    event_data['uid'] = request.headers['uid']
    event_data['username'] = request.headers['username']
    print("request = " + str(event_data))
    update_birthday_event(event_data)
    return 'success'   

@app.route('/birthday/delete', methods=['POST'])   
def delete_birthday_event_controller():
    event_data = request.json
    event_data['uid'] = request.headers['uid']
    event_data['username'] = request.headers['username']
    print("request = " + str(event_data))
    delete_birthday_event(event_data)
    return 'success'     

@app.route('/birthday/list', methods=['GET'])
def view_birthday_list_controller():
    username = request.headers['username']
    uid = request.headers['uid']    
    conn = sqlite3.connect(config.DATABASE_URL)
    cursor = conn.execute(f'SELECT * FROM BIRTHDAY WHERE USERNAME="{username}" AND UID={uid};')
    rows = cursor.fetchall()
    birthdays = [{'eid': row[0], 'name': row[3], 'relationship': row[4], 'year': row[5], 'month': row[6], 'day': row[7], 'notes': row[8], 'reminders': row[9], 'wishes': row[10], 'color': row[11]} for row in rows]
    return jsonify(birthdays)

@app.route('/notifications/add', methods=['POST'])   
def add_notifications_setting_controller():
    data = request.json
    data['uid'] = request.headers['uid']
    data['username'] = request.headers['username']
    return add_notifications_setting(data)

@app.route('/notifications/list', methods=['GET'])   
def list_notifications_setting_controller():
    data = {}
    data['uid'] = request.headers['uid']
    data['username'] = request.headers['username']
    return list_notifications_setting(data)

def timedelta_for_schedule(reminder):
    if reminder=='DEFAULT':
        return timedelta(days=0)
    else:
        return timedelta(days=int(reminder[:-1]))

def get_datetime_now():
    now = datetime.now()
    now = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return now

def refresh_alert(eid, username, reminder):
    conn = sqlite3.connect(config.DATABASE_URL)
    cursor = conn.execute(f'SELECT * FROM BIRTHDAY WHERE USERNAME="{username}" AND ID={eid} LIMIT 1;')
    row = cursor.fetchone()
    conn.close()
    month = row[6]
    day = row[7]
    name = row[3]
    reminders = row[9].split('|')
    for i, rem in enumerate(reminders):
        if rem == reminder:
            job_id = username + '-' + str(eid) + '-' + str(i)
            now = get_datetime_now()
            current = now.replace(month=month, day=day) - timedelta_for_schedule(rem)
            current = current.replace(year = current.year + 1)                         
            event_type = 'BDAY_EVENT' if rem=='DEFAULT' else 'BDAY_REMINDER'                
            scheduler.add_job(do_alert_for_event, 'date', run_date=current, args=[eid, username, name, event_type, rem], id=job_id)

### TODO implement email and WhatsApp reminder functionality
def do_alert_for_event(eid, username, name, event_type, reminder):
    if event_type=='BDAY_EVENT':
        print(f"Today is {name}'s birthday!")
    elif event_type=='BDAY_REMINDER':
        print(f"It's {name}'s birthday in {int(reminder[:-1])} day(s)")
    refresh_alert(eid, username, reminder)

def add_birthday_event(event_data):
    conn = sqlite3.connect(config.DATABASE_URL)

    uid = event_data['uid']
    username = event_data['username']
    name = event_data['name']
    relationship = event_data['relationship']
    year = event_data['year']
    month = event_data['month']
    day = event_data['day']
    notes = event_data['notes']
    reminders = event_data['reminders']
    wishes = event_data['wishes']
    color = event_data['color']

    cursor = conn.execute(f'INSERT INTO BIRTHDAY(UID, USERNAME, NAME, RELATIONSHIP, YEAR, MONTH, DAY, NOTES, REMINDERS, WISHES, COLOR) VALUES ("{uid}", "{username}", "{name}", "{relationship}", {year}, {month}, {day}, "{notes}", "{reminders}", "{wishes}", "{color}");')
    eid = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()
    reminders = reminders.split('|')
    now = get_datetime_now()
    for i, rem in enumerate(reminders):
        current = now.replace(month=month, day=day) - timedelta_for_schedule(rem)                              
        if current <= now:
            current = current.replace(year = current.year + 1)
        event_type = 'BDAY_EVENT' if rem=='DEFAULT' else 'BDAY_REMINDER'
        job_id = username + '-' + str(eid) + '-' + str(i)
        scheduler.add_job(do_alert_for_event, 'date', run_date=current, args=[eid, username, name, event_type, rem], id=job_id)

def update_birthday_event(event_data):
    conn = sqlite3.connect(config.DATABASE_URL)

    eid = event_data['eid']
    uid = event_data['uid']
    username = event_data['username']
    name = event_data['name']
    relationship = event_data['relationship']
    year = event_data['year']
    month = event_data['month']
    day = event_data['day']
    notes = event_data['notes']
    reminders = event_data['reminders']
    wishes = event_data['wishes']
    color = event_data['color']
    
    cursor = conn.execute(f'SELECT * FROM BIRTHDAY WHERE USERNAME="{username}" AND ID={eid} LIMIT 1;')
    row = cursor.fetchone()
    rescheduled = False
    if row != None:
        if reminders != row[9] or month != row[6] or day != row[7]:
            rescheduled = True
        conn.execute(f'UPDATE BIRTHDAY SET NAME="{name}", RELATIONSHIP="{relationship}", YEAR={year}, MONTH={month}, DAY={day}, NOTES="{notes}", REMINDERS="{reminders}", WISHES="{wishes}", COLOR="{color}" WHERE USERNAME="{username}" AND ID={eid};')
        conn.commit()
        conn.close()
        if rescheduled:
            now = get_datetime_now()
            old_schedules = row[9].split('|')
            new_schedules = reminders.split('|')
            for i, sched in enumerate(old_schedules):
                job_id = username + '-' + str(eid) + '-' + str(i)
                if scheduler.get_job(job_id):
                    scheduler.remove_job(job_id)
            for i, sched in enumerate(new_schedules):
                current = now.replace(month=month, day=day) - timedelta_for_schedule(sched)                              
                if current <= now:
                    current = current.replace(year = current.year + 1)          
                event_type = 'BDAY_EVENT' if sched=='DEFAULT' else 'BDAY_REMINDER'
                job_id = username + '-' + str(eid) + '-' + str(i)
                scheduler.add_job(do_alert_for_event, 'date', run_date=current, args=[uid, username, name, event_type, sched], id=job_id)
    else:
        print('username or event ID is not present in DB')

def delete_birthday_event(event_data):
    conn = sqlite3.connect(config.DATABASE_URL)

    eid = event_data['eid']
    username = event_data['username']
    
    cursor = conn.execute(f'SELECT * FROM BIRTHDAY WHERE USERNAME="{username}" AND ID={eid} LIMIT 1;')
    row = cursor.fetchone()    
    if row != None:
        conn.execute(f'DELETE FROM BIRTHDAY WHERE USERNAME="{username}" AND ID={eid};')
        conn.commit()
        conn.close()
        schedules = row[9].split('|')
        for i, sched in enumerate(schedules):
            job_id = username + '-' + str(eid) + '-' + str(i)
            if scheduler.get_job(job_id):
                scheduler.remove_job(job_id)
    else:
        print('username or event ID is not present in DB')

def list_notifications_setting(data):
    conn = sqlite3.connect(config.DATABASE_URL)

    uid = data['uid']
    username = data['username']

    cursor = conn.execute(f'SELECT * FROM TOOLBOX_DATA WHERE USERNAME="{username}" AND UID={uid} AND TOOL="bday" LIMIT 1;')
    row = cursor.fetchone()
    if row == None:
        return ''
    else:
        return row[4]


def add_notifications_setting(data):
    conn = sqlite3.connect(config.DATABASE_URL)

    uid = data['uid']
    username = data['username']
    type = data['type']
    value = data['value']    

    cursor = conn.execute(f'SELECT * FROM TOOLBOX_DATA WHERE USERNAME="{username}" AND UID={uid} AND TOOL="bday" LIMIT 1;')
    row = cursor.fetchone()
    if row == None:
        # add row
        bday_data = type + ':' + value        
        conn.execute(f'INSERT INTO TOOLBOX_DATA(UID, USERNAME, TOOL, DATA) VALUES({uid}, "{username}", "bday", "{bday_data}");')        
    else:
        # update row
        bday_data = row[4]
        if type in bday_data:            
            return 'setting already exists'
        bday_data = bday_data + "|" + type + ':' + value
        conn.execute(f'UPDATE TOOLBOX_DATA SET DATA = {json.dumps(bday_data, indent=4)} WHERE USERNAME="{username}" AND UID={uid} AND TOOL="bday";')
    conn.commit()
    cursor.close()
    conn.close()
    return 'success'

### TODO refresh schedules on code change API, error handling and messages in UI

if __name__ == '__main__':
    scheduler.start()
    app.run()