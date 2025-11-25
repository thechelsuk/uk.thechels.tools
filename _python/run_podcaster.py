from datetime import datetime
import xml.etree.ElementTree as ET
import yaml
import config

def process_opml(opml_file, output_file):
    tree = ET.parse(opml_file)
    root = tree.getroot()

    podcasts = []

    # Iterate over all the outline elements in the OPML file
    for outline in root.iter('outline'):
        title = outline.get('text')
        url = outline.get('xmlUrl')
        podcasts.append({'name': title, 'link': url})

    # Write the podcasts list to a YAML file
    with open(output_file, 'w') as yaml_file:
        yaml.dump(podcasts, yaml_file, default_flow_style=False)

# Call the function with the path to your OPML file and the output YAML file
opml_file = config.OPML_FILE
output_file =  config.POD_OUT
process_opml(opml_file, output_file)