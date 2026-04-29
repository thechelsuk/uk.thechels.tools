import json
import yaml
import os
import config
# File paths


SOURCE_JSON = config.PLAY_JSON
OUTPUT_YAML = config.PLAY_YAML
OUTPUT_OPML = config.PLAY_OPML

def main():

    with open(SOURCE_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)


    # Only extract channels from 'SubscriptionChannel' key if present
    if isinstance(data, dict) and 'SubscriptionChannel' in data:
        channels = data['SubscriptionChannel']
    else:
        channels = []

    output = []
    opml_outlines = []
    for entry in channels:
        channel_id = entry.get('channelID')
        name = entry.get('name')
        if channel_id and name:
            feedurl = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
            output.append({
                'ChannelID': channel_id,
                'Name': name,
                'FeedUrl': feedurl
            })
            opml_outlines.append(f'<outline text="{name}" title="{name}" type="rss" xmlUrl="{feedurl}" />')

    with open(OUTPUT_YAML, 'w', encoding='utf-8') as f:
        yaml.dump(output, f, allow_unicode=True, sort_keys=False)

    # Write OPML file
    opml_header = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<opml version="2.0">\n'
        '  <head>\n'
        '    <title>YouTube Channels</title>\n'
        '  </head>\n'
        '  <body>\n'
    )
    opml_footer = '  </body>\n</opml>\n'
    with open(OUTPUT_OPML, 'w', encoding='utf-8') as f:
        f.write(opml_header)
        for outline in opml_outlines:
            f.write(f'    {outline}\n')
        f.write(opml_footer)

if __name__ == "__main__":
    main()
