import csv
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

testVar = raw_input("Ask user for something.")

with open('../DatasetSamples/samples.csv', 'rb') as csvfile:
    spamreader = csv.reader(csvfile)
    for row in spamreader:
        word_list = word_tokenize(row[0]);
        filtered_words = [word for word in word_list if word not in stopwords.words('english')];
        print row[0];
        print ' '.join(filtered_words);

with open('../PreprocessData/result.csv', 'wb') as csvfile:
    spamwriter = csv.writer(csvfile);
    spamwriter.writerow(['Spam'] * 5 + ['Baked Beans']);
    spamwriter.writerow(['Spam', 'Lovely Spam', 'Wonderful Spam']);
