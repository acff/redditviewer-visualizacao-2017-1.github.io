import csv, json
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

files = ['../../DatasetSamples/samples', '../../DatasetSamples/samples'];
dataFinal = [];


with open('final_file.json', mode='w') as f:
    json.dump([], f)

for file_in in files:
	print file_in
	words = "";

	csv_input =  open(file_in + '.csv', 'rb');

	reader = csv.reader(csv_input)

	for row in reader:
		word_list = word_tokenize(row[1]);
		filtered_words = [word for word in word_list if word not in stopwords.words('english')];
		#Write csv file on format [meta, subrredit, filtered_text]// filtered_text == text sem stopwords
		#writer.writerow([str(row[3]), str(row[4]), ' '.join(filtered_words)]);
		words += ' '.join(filtered_words)

	freq = nltk.FreqDist(word_tokenize(words));
	data = [];
	for word, frequency in freq.most_common(30):
		data.append({"text":str(word), "size":frequency});
	with open('final_file.json', mode='w') as feedsjson:
	    dataFinal.append(data)
	    json.dump(dataFinal, feedsjson)







