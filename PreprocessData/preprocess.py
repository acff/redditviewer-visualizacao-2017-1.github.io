import csv
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

csv_input =  open('../DatasetSamples/samples.csv', 'rb');
csv_output = open('result.csv', 'wb');

reader = csv.reader(csv_input)
writer = csv.writer(csv_output);

for row in reader:
	word_list = word_tokenize(row[0]);
	filtered_words = [word for word in word_list if word not in stopwords.words('english')];
	#Write csv file on format [meta, subrredit, filtered_text]
	writer.writerow([str(row[2]), str(row[3]), ' '.join(filtered_words)]);
	#print ('>>>>> ' + str(row[0]));
	#print ' '.join(filtered_words);

