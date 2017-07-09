
import csv, json, operator
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

files = ['learning_askhistorians'];
dataFinal = [];
'''
'entertainment_anime',
'entertainment_comicbooks',
'entertainment_harrypotter',
'entertainment_movies',
'entertainment_music',
'entertainment_starwars',
'gaming_dota2',
'gaming_gaming',
'gaming_leagueoflegends',
'gaming_minecraft',
'gaming_pokemon',
'gaming_skyrim',
'gaming_starcraft',
'gaming_tf2',
'headers',
'humor_adviceanimals',
'humor_circlejerk',
'humor_facepalm',
'humor_funny',
'humor_imgoingtohellforthis',
'humor_jokes',
'learning_askhistorians',
'learning_askscience',
'learning_explainlikeimfive',
'learning_science',
'learning_space',
'learning_todayilearned',
'learning_youshouldknow',
'lifestyle_drunk',
'lifestyle_food',
'lifestyle_frugal',
'lifestyle_guns',
'lifestyle_lifehacks',
'lifestyle_motorcycles',
'lifestyle_progresspics',
'lifestyle_sex',
'news_conservative',
'news_conspiracy',
'news_libertarian',
'news_news',
'news_offbeat',
'news_politics',
'news_truereddit',
'news_worldnews',
'television_breakingbad',
'television_community',
'television_doctorwho',
'television_gameofthrones',
'television_himym',
'television_mylittlepony',
'television_startrek',
'television_thewalkingdead',
'''

with open('final_file.json', mode='w') as f:
    json.dump([], f)

for file_in in files:
	print file_in + '...'
	freq = {}

	csv_input =  open(file_in + '.csv', 'rb');

	reader = csv.reader(csv_input)

	for row in reader:
		word_list = word_tokenize(row[1]);
		filtered_words = [word for word in word_list if word not in stopwords.words('english')];
		for word in filtered_words:
			if(freq.has_key(word)):
				freq[word] += 1
			else:
				freq[word] = 1
	sorted_freq = sorted (freq.items(), key=operator.itemgetter(1))

	data = [];
	for word, frequency in sorted_freq[-30:]:
		data.append({"text":str(word), "size":frequency});

	with open('final_file.json', mode='w') as feedsjson:
	    dataFinal.append(data)
	    json.dump(dataFinal, feedsjson)



'''
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
'''







'''
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


'''




