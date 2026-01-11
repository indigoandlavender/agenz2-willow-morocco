# TIFORT-CORE Google Sheets Structure

This document describes how to set up your Google Sheets database for TIFORT-CORE.

## Spreadsheet Setup

1. Create a new Google Spreadsheet
2. Rename it to "TIFORT-CORE Database"
3. Create the following sheets (tabs):

---

## Sheet 1: Properties

**Tab Name:** `Properties`

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | id | String | Unique identifier |
| B | created_at | DateTime | Creation timestamp |
| C | updated_at | DateTime | Last update timestamp |
| D | title | String | Property title |
| E | description | String | Property description |
| F | asset_type | Enum | `Apartment`, `Villa`, or `Land` |
| G | address | String | Full address |
| H | city | String | City (default: Marrakech) |
| I | neighborhood | String | Neighborhood name |
| J | gps_latitude | Number | GPS latitude |
| K | gps_longitude | Number | GPS longitude |
| L | terrain_size_m2 | Number | Land size in m² |
| M | built_size_m2 | Number | Built area in m² |
| N | floors | Number | Number of floors |
| O | rooms | Number | Number of rooms |
| P | bathrooms | Number | Number of bathrooms |
| Q | year_built | Number | Construction year |
| R | market_price | Number | Scraped market price (MAD) |
| S | forensic_price | Number | Audited forensic price (MAD) |
| T | price_per_m2 | Number | Price per square meter |
| U | zoning_code | Enum | `SD1`, `GH2`, `SA1`, `S1`, `ZI`, `ZA` |
| V | zoning_potential_value | Number | Potential value based on zoning |
| W | risk_grade | Enum | `A`, `B`, `C`, `D`, `E`, `F` |
| X | structural_health_score | JSON | SHS data (see below) |
| Y | cap_rate | Number | Capitalization rate % |
| Z | gross_yield | Number | Gross yield % |
| AA | net_yield | Number | Net yield % |
| AB | resilience_score | Number | 2030 resilience score |
| AC | alpha_score | Number | Hidden value indicator |
| AD | distance_tgv_station | Number | Distance to TGV (km) |
| AE | distance_grand_stade | Number | Distance to Stadium (km) |
| AF | distance_new_highway | Number | Distance to Highway (km) |
| AG | distance_airport | Number | Distance to Airport (km) |
| AH | infrastructure_proximity_score | Number | Overall proximity score |
| AI | compliance_status | Enum | `compliant`, `non_compliant`, `pending_review`, `expired` |
| AJ | bill_34_21_flagged | Boolean | TRUE/FALSE |
| AK | vna_required | Boolean | TRUE/FALSE |
| AL | tax_gate_passed | Boolean | TRUE/FALSE |
| AM | source_url | String | Original listing URL |
| AN | source_portal | String | Source portal name |
| AO | is_verified | Boolean | TRUE/FALSE |
| AP | verified_at | DateTime | Verification timestamp |
| AQ | audit_notes | String | Notes separated by `||` |

### Structural Health Score JSON Format (Column X):
```json
{
  "seismic_chaining": true,
  "rps_2011_compliant": true,
  "rps_2026_compliant": false,
  "humidity_score": 3,
  "foundation_depth_m": 2.5,
  "roof_life_years": 25,
  "overall_score": 82
}
```

---

## Sheet 2: ZoningCodes

**Tab Name:** `ZoningCodes`

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | id | String | Unique identifier |
| B | code | String | Zone code (SD1, GH2, etc.) |
| C | name | String | Full name |
| D | description | String | Zone description |
| E | min_terrain_m2 | Number | Minimum terrain size |
| F | cos | Number | COS coefficient |
| G | ces | Number | CES coefficient |
| H | max_height_m | Number | Maximum height |
| I | max_floors | Number | Maximum floors |
| J | multi_unit_allowed | Boolean | TRUE/FALSE |
| K | max_units_per_hectare | Number | Maximum density |
| L | commercial_allowed | Boolean | TRUE/FALSE |
| M | hotel_allowed | Boolean | TRUE/FALSE |
| N | notes | String | Additional notes |

### Default Zoning Data:

| code | name | min_terrain_m2 | cos | ces | max_floors |
|------|------|----------------|-----|-----|------------|
| SD1 | Secteur Diffus 1 - Villas | 1000 | 0.07 | 0.05 | 2 |
| GH2 | Groupement d'Habitat 2 | 250 | 0.40 | 0.35 | 5 |
| SA1 | Secteur d'Animation 1 | 500 | 0.60 | 0.50 | 7 |
| S1 | Secteur Touristique 1 | 1000 | 0.50 | 0.40 | 5 |
| ZI | Zone Industrielle | 2000 | 0.70 | 0.60 | 3 |
| ZA | Zone Agricole | 10000 | 0.02 | 0.01 | 1 |

---

## Sheet 3: Infrastructure

**Tab Name:** `Infrastructure`

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | id | String | Unique identifier |
| B | name | String | Infrastructure name |
| C | category | Enum | `tgv_station`, `stadium`, `highway`, `airport`, `industrial_zone` |
| D | description | String | Description |
| E | gps_latitude | Number | GPS latitude |
| F | gps_longitude | Number | GPS longitude |
| G | completion_year | Number | Expected completion year |
| H | is_operational | Boolean | TRUE/FALSE |
| I | impact_radius_km | Number | Impact radius in km |
| J | value_multiplier | Number | Value impact (1.0 = neutral) |

### Default 2030 Infrastructure:

| name | category | lat | lng | year | multiplier |
|------|----------|-----|-----|------|------------|
| Gare LGV Marrakech | tgv_station | 31.6295 | -8.0089 | 2027 | 1.25 |
| Grand Stade de Marrakech | stadium | 31.5847 | -8.0756 | 2029 | 1.40 |
| Autoroute Marrakech-Agadir | highway | 31.5500 | -8.2000 | 2028 | 1.15 |
| Aéroport Menara | airport | 31.6069 | -8.0363 | 2020 | 1.10 |

---

## Sheet 4: Documents

**Tab Name:** `Documents`

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | id | String | Unique identifier |
| B | property_id | String | Reference to property |
| C | document_type | Enum | See below |
| D | file_url | String | Google Drive link |
| E | file_name | String | Original filename |
| F | is_verified | Boolean | TRUE/FALSE |
| G | qr_code_verified | Boolean | TRUE/FALSE |
| H | document_date | Date | Document date |
| I | expiry_date | Date | Expiration date |
| J | reference_number | String | Official reference |
| K | issuing_authority | String | Issuing authority |

### Document Types (Forensic Seven):
- `certificat_propriete` - Certificat de Propriété
- `note_renseignement` - Note de Renseignement
- `quitus_fiscal` - Quitus Fiscal
- `plan_cadastral` - Plan Cadastral
- `certificat_conformite` - Certificat de Conformité
- `vna` - VNA Authorization
- `tnb_tax` - TNB Tax Receipt

---

## Sheet 5: MarketListings

**Tab Name:** `MarketListings`

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | id | String | Unique identifier |
| B | scraped_at | DateTime | Scrape timestamp |
| C | source_portal | String | agenz, mubawab, sarouty |
| D | source_url | String | Original URL |
| E | title | String | Listing title |
| F | asset_type | Enum | Apartment, Villa, Land |
| G | city | String | City |
| H | neighborhood | String | Neighborhood |
| I | asking_price | Number | Listed price (MAD) |
| J | terrain_size_m2 | Number | Land size |
| K | built_size_m2 | Number | Built size |
| L | price_per_m2 | Number | Price per m² |
| M | matched_property_id | String | Matched TIFORT property |
| N | price_gap_percent | Number | Gap vs forensic price |

---

## Setup Instructions

1. **Create the Spreadsheet:**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Add each sheet tab with the names above

2. **Add Headers:**
   - In each sheet, add the column headers in Row 1
   - Format Row 1 as bold

3. **Get Spreadsheet ID:**
   - The ID is in the URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
   - Add this to your `.env.local` as `GOOGLE_SPREADSHEET_ID`

4. **Configure Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a project or select existing
   - Enable "Google Sheets API"
   - Create a Service Account
   - Download the JSON key
   - Share your spreadsheet with the service account email
   - Add the JSON key to `.env.local` as `GOOGLE_SERVICE_ACCOUNT_KEY`

5. **Populate Default Data:**
   - Add the default zoning codes to the ZoningCodes sheet
   - Add the 2030 infrastructure to the Infrastructure sheet

---

## Formulas & Automations

You can add these Google Sheets formulas for automatic calculations:

### Price per m² (Column T in Properties):
```
=IF(AND(M2>0,R2>0),R2/M2,IF(AND(L2>0,R2>0),R2/L2,""))
```

### Alpha Percentage:
```
=IF(AND(V2>0,R2>0),(V2-R2)/R2*100,"")
```

### Conditional Formatting:
- Risk Grade A-B: Green background
- Risk Grade C: Yellow background
- Risk Grade D-F: Red background
- is_verified = TRUE: Green check
- tax_gate_passed = FALSE: Red flag

---

## Sample Data Row

Here's an example property row:

```
1705312345678-abc1234 | 2024-01-15T10:00:00Z | 2024-01-15T10:00:00Z | Modern Villa Palmeraie | Stunning 4-bedroom villa | Villa | Route de Fes, Palmeraie | Marrakech | palmeraie | 31.665 | -7.970 | 2500 | 450 | 2 | 4 | 3 | 2021 | 8500000 | 7200000 | 16000 | SD1 | 8000000 | B | {"seismic_chaining":true,...} | 5.2 | 6.8 | 4.9 | 75 | 15 | 8.5 | 12.0 | 5.0 | 15.0 | 82 | compliant | FALSE | FALSE | TRUE | https://agenz.ma/... | agenz | TRUE | 2024-01-15T12:00:00Z | Excellent condition
```
