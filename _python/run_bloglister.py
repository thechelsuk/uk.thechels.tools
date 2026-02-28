from datetime import datetime
import xml.etree.ElementTree as ET
import yaml
import config

def process_opml(opml_file, output_file):
    tree = ET.parse(opml_file)
    root = tree.getroot()

    blogs = []

    # Find the '2 - Blogs' folder (outline)
    for folder in root.findall('.//outline'):
        folder_title = folder.get('title') or folder.get('text')
        if folder_title and folder_title.strip().startswith('2 - Blogs'):
            # Only process direct children of this folder
            for outline in folder.findall('outline'):
                title = outline.get('title') or outline.get('text')
                html_url = outline.get('htmlUrl', '')
                xml_url = outline.get('xmlUrl', '')
                # Only include items with a title starting with 'Blog'
                if title and title.strip().startswith('Blog') and html_url.strip():
                    blogs.append({
                        'title': title.strip(),
                        'htmlUrl': html_url.strip(),
                        'xmlUrl': xml_url.strip() if xml_url else ''
                    })
            break  # Only process the first matching '2 - Blogs' folder

    # Ensure 'title' is the first key in each dict for YAML output
    from collections import OrderedDict
    def ordered_blog(blog):
        return OrderedDict([
            ('title', blog['title']),
            ('htmlUrl', blog['htmlUrl']),
            ('xmlUrl', blog['xmlUrl'])
        ])
    blogs_ordered = [ordered_blog(b) for b in blogs]

    class OrderedDumper(yaml.SafeDumper):
        pass
    def _dict_representer(dumper, data):
        return dumper.represent_dict(data.items())
    OrderedDumper.add_representer(OrderedDict, _dict_representer)

    with open(output_file, 'w') as yaml_file:
        yaml.dump(blogs_ordered, yaml_file, default_flow_style=False, Dumper=OrderedDumper)

# Call the function with the path to your OPML file and the output YAML file
opml_file = config.NNW_FILE
output_file =  config.NNW_OUT
process_opml(opml_file, output_file)