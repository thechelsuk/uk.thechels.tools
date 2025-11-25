#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import feedparser
import datetime
import os
from time import mktime
from email.utils import parsedate_to_datetime
import config
# File paths

OPML_FILE = config.OPML_FILE
OUTPUT_FILE = config.OUTPUT_FILE


def parse_opml(opml_file):
    """Parse the OPML file and extract feed URLs."""
    tree = ET.parse(opml_file)
    root = tree.getroot()

    feeds = []
    # Find all outline elements with xmlUrl attribute (podcast feeds)
    for outline in root.findall('.//outline'):
        xml_url = outline.get('xmlUrl')
        title = outline.get('text')
        if xml_url:
            feeds.append({'title': title, 'url': xml_url})

    return feeds

def get_latest_episode(feed_url):
    """Fetch and parse the feed to get the latest episode."""
    try:
        feed = feedparser.parse(feed_url)

        if not feed.entries:
            return None

        # Get the latest episode (first entry in most feeds)
        latest = feed.entries[0]

        # Get podcast title from feed
        podcast_title = feed.feed.title if hasattr(feed.feed, 'title') else "Unknown Podcast"

        # Get episode title
        episode_title = latest.title if hasattr(latest, 'title') else "Untitled Episode"

        # Get publication date
        pub_date = None
        if hasattr(latest, 'published_parsed') and latest.published_parsed:
            pub_date = datetime.datetime.fromtimestamp(mktime(latest.published_parsed))
        elif hasattr(latest, 'pubDate'):
            try:
                pub_date = parsedate_to_datetime(latest.pubDate)
            except:
                pass

        if not pub_date:
            pub_date_str = "Unknown date"
        else:
            pub_date_str = pub_date.strftime("%Y-%m-%d")

        return {
            'podcast_title': podcast_title,
            'episode_title': episode_title,
            'pub_date': pub_date_str,
            'pub_datetime': pub_date  # For sorting
        }

    except Exception as e:
        print(f"Error fetching feed {feed_url}: {str(e)}")
        return None

def main():
    if not os.path.isfile(OPML_FILE):
        print(f"Error: File {OPML_FILE} not found")
        return

    print(f"Parsing OPML file: {OPML_FILE}")
    feeds = parse_opml(OPML_FILE)
    print(f"Found {len(feeds)} feeds")

    results = []
    for i, feed in enumerate(feeds, 1):
        print(f"Processing feed {i}/{len(feeds)}: {feed['title']}")
        episode = get_latest_episode(feed['url'])

        if episode:
            results.append(episode)

    # Sort by publication date, most recent first
    results = sorted(
        [r for r in results if r and r.get('pub_datetime')],
        key=lambda x: x.get('pub_datetime') or datetime.datetime.min,
        reverse=True
    )

    # Generate the markdown with a table
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("# Latest Podcast Episodes\n\n")
        f.write(f"*Updated on {datetime.datetime.now().strftime('%Y-%m-%d')}*\n\n")

        # Create a markdown table
        f.write("| Podcast | Latest Episode | Published |\n")
        f.write("|---------|----------------|----------|\n")

        for episode in results:
            # Escape pipe characters in titles to prevent breaking the table format
            podcast_title = episode['podcast_title'].replace('|', '\\|')
            episode_title = episode['episode_title'].replace('|', '\\|')

            f.write(f"| {podcast_title} | {episode_title} | {episode['pub_date']} |\n")

    print(f"Results written to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()