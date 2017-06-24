import csv
import nltk
from nltk.tokenize import word_tokenize

wordCount_input = open('result.csv', 'rb');
wordCount_output = open('wordCountTest.csv', 'wb');

reader = csv.reader(wordCount_input)
writer = csv.writer(wordCount_output);

words = "";
for row in reader:
	words += row[2];

#print (words);
freq = nltk.FreqDist(word_tokenize(words));

for word, frequency in freq.most_common(10):
		writer.writerow([str(word), frequency]);
	
