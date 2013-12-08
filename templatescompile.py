#! usr/bin/python

import markdown, glob, string, json, subprocess

md = markdown.Markdown(extensions = ['meta', 'attr_list'], output_format='html5')

jsondata = open('config.txt').read().splitlines()

for filename in glob.iglob('markdown/*'):
	outputfile = 'templates/%s.hbs' % string.lstrip(filename, 'markdown/')
	md.convertFile(input = filename, output = outputfile)
	meta = {k : v[0] for k, v in md.Meta.items()}
	route = meta['route']
	jsondata[jsondata.index(route)] = meta

print jsondata

for index, item in enumerate(jsondata):
	if ';' in item:
		r, t = item.split(';')
		print r, t
		jsondata[index] = {'route': r, 'title': t}

print jsondata
json.dump(jsondata, open('config.json', 'w'))

subprocess.call('ember-precompile templates/*.hbs -f templates/templates.js', shell=True)