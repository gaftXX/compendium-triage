# Office Data Fields

This document lists every single data field that can be saved for a single office in the Compendium system.

## Base Document Fields

### `id` - string (format: CCccNNN, e.g., "SPBA831")
- System Generated

### `createdAt` - Timestamp
- System Generated

### `updatedAt` - Timestamp
- System Generated

## Core Identity Fields

### `name` - string (Display name, e.g., "Zaha Hadid Architects")
- Manual
- AI Extraction
- Google Scraping

### `officialName` - string (Legal name, e.g., "Zaha Hadid Architects Ltd.")
- Manual
- AI Extraction

### `founded` - number (Year established)
- Manual
- AI Extraction

### `founder` - string (optional, Person who founded the office)
- Manual
- AI Extraction

### `status` - string (Options: 'active', 'acquired', 'dissolved')
- Manual
- AI Extraction

### `website` - string (optional, Office website URL)
- Manual
- AI Extraction
- Google Scraping

### `infoEntries` - number (Count of information entries)
- System Generated

## Location Fields

### `location.headquarters.city` - string
- Manual
- AI Extraction
- Google Scraping

### `location.headquarters.country` - string
- Manual
- AI Extraction
- Google Scraping

### `location.headquarters.coordinates` - GeoPoint (optional)
- Manual
- Google Scraping

### `location.headquarters.address` - string (optional)
- Manual
- AI Extraction
- Google Scraping

### `location.headquarters.neighborhood` - string (optional)
- Manual
- AI Extraction
- Google Scraping

### `location.otherOffices` - array of objects
- Manual
- AI Extraction

### `location.otherOffices[].address` - string
- Manual
- AI Extraction

### `location.otherOffices[].coordinates` - GeoPoint
- Manual
- Google Scraping

## Size Fields

### `size.employeeCount` - number (optional)
- Manual
- AI Extraction
- System Generated

### `size.sizeCategory` - string (optional, Options: 'boutique', 'medium', 'large', 'global')
- Manual
- AI Extraction

### `size.annualRevenue` - number (optional)
- Manual
- AI Extraction

## Practice Fields

### `specializations` - array of strings
- Manual
- AI Extraction

### `notableWorks` - array of strings (Famous projects)
- Manual
- AI Extraction

## Connection Counts (Denormalized)

### `connectionCounts.totalProjects` - number
- System Generated

### `connectionCounts.activeProjects` - number
- System Generated

### `connectionCounts.clients` - number
- System Generated

### `connectionCounts.competitors` - number
- System Generated

### `connectionCounts.suppliers` - number
- System Generated

## Complete Field Count
Total: 28 distinct data fields (including nested fields)

## Input Methods

- Manual
- AI Extraction
- Google Scraping
- System Generated

