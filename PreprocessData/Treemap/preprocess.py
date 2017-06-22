import csv, json

csv_input =  open('comments.csv', 'rb');

reader = csv.reader(csv_input)

data = {};
count = 0;
for row in reader:
	key = (row[3], row[2]);
	if key in data.keys():
		data[key] += 1;
	else:
		data[key] = 1;
	count += 1;
	print "count >> " + str(count)

dataFinal = [];
for (meta, sub) in data.keys():
	obj = {};
	obj['key'] = 'Comments';
	obj['region'] = str(meta);
	obj['subregion'] = str(sub);
	obj['value'] = data[(meta, sub)];
	dataFinal.append(obj);

with open('treemapTest.json', 'w') as f:
     json.dump(dataFinal, f)