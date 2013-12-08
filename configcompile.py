import re, markdown, glob, string, subprocess

router_template = """App.Router.map(function() {\n\t%s});"""
resource_template = """this.resource('%s', function() {\n\t%s});\n"""
resource_path_template = """this.resource('%s', { path : '%s'}, function() {\n\t%s\n});\n"""
route_template = """this.route('%s');\n"""
route_path_template = """this.route('%s', { path: '%s' });\n"""

def munge(routes, parent_route = ''):
	route_array = filter(None, re.split(r";\n*(\b|$)", routes))

	router_string = ''
	json_config = []

	for item in route_array:
		route, path, title, bundle = re.match(r"\s*(\w+)\s*,\s*(?:(\S*?)\s*,)?\s*([\w ]+)\s*(?:{\s*([^}]+)\s*)?", item).groups()

		if bundle:
			json_item = {'route':route, 'title':title}
			bundle = re.sub("\n\t", '\n', bundle)
			m_r, json_children = munge(bundle, route)
			json_item['children'] = json_children

			if path:
				router_string += (resource_path_template % (route, path, m_r))
			else:
				router_string += (resource_template % (route, m_r))
		else:
			json_item = {'route':parent_route+'.'+route, 'title':title}
			if path:
				router_string += (route_path_template % (route, path))
			else:
				router_string += (route_template % (route))
		json_config.append(json_item)

	return router_string, json_config


# config = open('config.txt').read()
config = open('testconfig.txt').read()
router_string, json_config = munge(config)

json_config = [{'route': 'index', 'title': 'Home Page', 'children': json_config }]

open('js/router.js', 'w').write(router_template % router_string)
open('js/config.js', 'w').write('App.Config = ' + str(json_config) + ';')

md = markdown.Markdown(extensions = ['attr_list'], output_format='html5')
for filename in glob.iglob('markdown/*'):
	tempf = string.lstrip(filename, 'markdown/')
	tempf = string.rstrip(tempf, '.md')
	outputfile = 'templates/%s.hbs' % tempf
	md.convertFile(input = filename, output = outputfile)
subprocess.call('ember-precompile templates/*.hbs -f templates/templates.js', shell=True)