import csv

##########################
# Write csv file given thread/comment file
# [type, meta, subreddit, author]
#Params
##input_files > ['file_in_1', 'file_in_2']
##output_file > 'file_out'
##########################

def getAuthorsByMetaAndSubreddit (input_files, output_file):
	#Output file format >> [meta, sub, author]
	csv_output = open( output_file + '.csv', 'wb');
	writer = csv.writer(csv_output);

	for f in input_files:
		csv_input =  open( f + '.csv', 'rb');
		reader = csv.reader(csv_input);
		
		if f == "threads":
			for row in reader:
				if not str(row[5]) == "":
					writer.writerow([f, str(row[3]), str(row[2]), str(row[5])]);
		elif f == "comments":
			for row in reader:
				if not str(row[7]) == "":
					writer.writerow([f, str(row[5]), str(row[4]), str(row[7])]);

##########################
# Generate dictionary of authors by meta/subreddit
#Params
##tuples > [('humor', ['funny', 'jokes'])]
##file_in > 'file_name' on format [type, meta, subreddit, author]
##########################
def getAuthorsDictionary(tuples, file_in):
	#tuples = [('humor', ['funny', 'jokes'])];
	data = {};
	for (meta, subs) in tuples:
		#data[meta] = {};
		for sub in subs:
			data[sub] = [];

	#csv file on formart [meta, sub, author]
	csv_input = open(file_in +'.csv', 'rb'); 
	reader = csv.reader(csv_input);

	for row in reader:
		meta = str(row[1]);
		subreddit = str(row[2]);
		author = str(row[3]);

		data[subreddit].append(author);

	return data;

##########################
# Generate links to FDL
#Params
##data > {subreddit:[authors]}
##########################
def getLinks(data):
	links = {};#relaciona dois subs

	for subA in data.keys():
		links[subA] = {};
		for subB in data.keys():
			if (subA != subB):
				links[subA][subB] = 0;

	for subA in data.keys():
		for subB in data.keys():
			if (subA != subB):
				for author in data[subB]:
					if (author in data[subA]):
						links[subA][subB] += 1;
	return links;

#### Main

input_test = ['threads', 'comments'];
output = 'output_test';
getAuthorsByMetaAndSubreddit(input_test, output_test);
data = getAuthorsDictionary([('humor', ['funny', 'jokes'])], output_test);
links = getLinks(data);

print (data);
