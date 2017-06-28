import csv
import datetime 

csv_input =  open('resultByHour.csv', 'rb');
csv_output = open('resultByDay.csv', 'wb');

reader = csv.reader(csv_input)
writer = csv.writer(csv_output);

data = {}
for row in reader:
	key = (row[0], row[1], row[2])
	if key in data.keys():
		data[key] += int(row[3])
	else:
		data[key] = int(row[3])
for meta, sub, day in data:
	print(meta, sub, day)
	writer.writerow([str(meta), str(sub), str(day), str(data[(meta,sub,day)])]);

'''
def intToString(weekday):
	day = ""
	if (weekday == 0):
		day = "Mon"
	elif (weekday == 1):
		day = "Tue"
	elif (weekday == 2):
		day = "Wed"
	elif (weekday == 3):
		day = "Thu"
	elif (weekday == 4):
		day = "Fri"
	elif (weekday == 5):
		day = "Sat"
	elif (weekday == 6):
		day = "Sun"
	return day

data = {};
count = 0
for row in reader:
	count += 1
	print count
	if(row[4] != ""):
		date = datetime.datetime.fromtimestamp(float(row[4]))
		#print (row[3], row[2], str(intToString(date.weekday())), str(date.hour))
		key = (row[3], row[2], str(intToString(date.weekday())), str(date.hour))
		if (key in data.keys()):
			data[key] += 1
		else:
			data[key] = 1
		#print (date)
		#print ("DAy: " + str(intToString(date.weekday())) + " -- Hour: " + str(date.hour))

for meta, sub, day, hour in data:
	print(meta, sub, day, hour)
	writer.writerow([str(meta), str(sub), str(day), str(hour), str(data[(meta,sub,day,hour)])]);
'''