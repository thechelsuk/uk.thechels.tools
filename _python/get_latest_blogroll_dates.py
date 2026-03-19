#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import feedparser
import datetime
import os
from time import mktime
from email.utils import parsedate_to_datetime
from urllib.parse import urlparse
import config
# File paths

OPML_FILE = config.NNW_FILE
OUTPUT_FILE = config.BLOGROLL_OUTPUT_FILE
CUTOFF_DATE = datetime.date(2026, 1, 1)


def parse_opml(opml_file):
    """Parse OPML and extract RSS feed metadata."""
    tree = ET.parse(opml_file)
    root = tree.getroot()

    subscriptions = []
    for outline in root.findall('.//outline'):
        xml_url = outline.get('xmlUrl')
        html_url = outline.get('htmlUrl')
        title = outline.get('text') or outline.get('title')
        if xml_url:
            subscriptions.append(
                {
                    'opml_title': title,
                    'feed_url': xml_url,
                    'site_url': html_url,
                }
            )

    return subscriptions


def build_shallow_site_url(source_url):
    """Return domain root or first-level path from a URL."""
    if not source_url:
        return ""

    parsed_url = urlparse(source_url)
    if not parsed_url.netloc:
        return source_url

    scheme = parsed_url.scheme or "https"
    path_parts = [segment for segment in parsed_url.path.split('/') if segment]

    if not path_parts:
        truncated_path = "/"
    else:
        truncated_path = f"/{path_parts[0]}/"

    return f"{scheme}://{parsed_url.netloc}{truncated_path}"


def fetch_latest_feed_item(feed_url):
    """Fetch and parse a feed to get latest item metadata."""
    try:
        parsed_feed = feedparser.parse(feed_url)

        if not parsed_feed.entries:
            return None

        latest_entry = parsed_feed.entries[0]

        feed_title = parsed_feed.feed.title if hasattr(parsed_feed.feed, 'title') else "Unknown Feed"
        item_title = latest_entry.title if hasattr(latest_entry, 'title') else "Untitled Post"

        published_at = None
        if hasattr(latest_entry, 'published_parsed') and latest_entry.published_parsed:
            published_at = datetime.datetime.fromtimestamp(mktime(latest_entry.published_parsed))
        elif hasattr(latest_entry, 'pubDate'):
            try:
                published_at = parsedate_to_datetime(latest_entry.pubDate)
            except Exception:
                pass

        if not published_at:
            return None

        published_date = published_at.date()

        return {
            'feed_title': feed_title,
            'post_title': item_title,
            'published_at': published_at,
            'published_date': published_date,
            'published_date_str': published_date.strftime("%Y-%m-%d"),
        }

    except Exception as e:
        print(f"Error fetching feed {feed_url}: {str(e)}")
        return None

def main():
    if not os.path.isfile(OPML_FILE):
        print(f"Error: File {OPML_FILE} not found")
        return

    print(f"Parsing OPML file: {OPML_FILE}")
    subscriptions = parse_opml(OPML_FILE)
    print(f"Found {len(subscriptions)} feeds")

    stale_feeds = []
    for index, subscription in enumerate(subscriptions, 1):
        feed_label = subscription['opml_title'] or subscription['feed_url']
        print(f"Processing feed {index}/{len(subscriptions)}: {feed_label}")

        latest_item = fetch_latest_feed_item(subscription['feed_url'])
        if not latest_item:
            continue

        if latest_item['published_date'] < CUTOFF_DATE:
            preferred_url = subscription.get('site_url') or subscription['feed_url']
            link_url = build_shallow_site_url(preferred_url)

            stale_feeds.append(
                {
                    'published_date': latest_item['published_date'],
                    'published_date_str': latest_item['published_date_str'],
                    'opml_title': subscription['opml_title'] or '',
                    'feed_title': latest_item['feed_title'] or feed_label,
                    'post_title': latest_item['post_title'],
                    'link_url': link_url,
                }
            )

    stale_feeds.sort(key=lambda item: item['published_date'])

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:

        f.write("---\n")
        f.write(f"title: Latest RSS Items\nlayout: blogroll-dates\npermalink: /blogroll-dates/\n\n---\n\n")
        f.write(f"*Updated on {datetime.datetime.now().strftime('%Y-%m-%d')}*\n\n")

        f.write("| Date | Feed | Blog | Last Post |\n")
        f.write("|------|------|------|-----------|\n")

        for stale_feed in stale_feeds:
            opml_label = stale_feed['opml_title'].replace('|', '\\|')
            blog_title = stale_feed['feed_title'].replace('|', '\\|')
            last_post_title = stale_feed['post_title'].replace('|', '\\|')
            blog_link = f"[{blog_title}]({stale_feed['link_url']})"

            f.write(
                f"| {stale_feed['published_date_str']} | {opml_label} | {blog_link} | {last_post_title} |\n"
            )

    print(f"Results written to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()