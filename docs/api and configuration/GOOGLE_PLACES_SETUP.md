# Google Places API Setup Guide

## Overview

The office scraping functionality uses Google Places API to find architecture offices in specific locations. This guide explains how to set up and configure the Google Places API integration.

## Required API Keys

### Google Places API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to only the required APIs for security

### Environment Variables

Add the following environment variable to your `.env` file:

```bash
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

## Usage

### Basic Office Scraping

The system detects office scraping requests through natural language patterns:

- "office scrape in Barcelona"
- "make a office scrape in New York"n
- "scrape offices in London"
- "find architecture offices in Tokyo"

### Advanced Usage

You can specify radius in your requests:

- "office scrape in Barcelona within 5km"
- "make a office scrape in New York within 10 miles"

### Commands

1. **Start Scraping**: Type "start scraper" after specifying a location
2. **Check Status**: The system will show progress and results automatically

## API Limits and Costs

- Google Places API has usage limits and costs per request
- The system searches for multiple keywords to find architecture offices
- Each search uses one API call
- Detailed place information requires additional API calls

## Security

- Never commit your API keys to version control
- Use environment variables for configuration
- Restrict your API keys to specific domains/IPs when possible
- Monitor your API usage in the Google Cloud Console

## Troubleshooting

### Common Issues

1. **API Key Not Set**: Make sure `VITE_GOOGLE_PLACES_API_KEY` is set in your environment
2. **Quota Exceeded**: Check your Google Cloud Console for usage limits
3. **No Results Found**: Try different keywords or increase the search radius
4. **Location Not Found**: Ensure the location name is spelled correctly

### Debug Mode

Enable debug logging by checking the browser console for detailed information about the scraping process.
