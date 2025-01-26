import json
import sys
import re
from typing import Dict, Set
from pathlib import Path
from decimal import Decimal

# resort_list = [
#     "Kirkwood Mountain",
#     "Heavenly Mountain Resort",
#     "Northstar at Tahoe",
#     "Palisades Tahoe Alpine Meadows",
#     "Palisades Tahoe Olympic Valley",
#     "Mammoth Mountain",
#     "Squaw Valley Alpine Meadows",
#     "Sierra at Tahoe",
#     "Tahoe Donner",
#     "Diamond Peak",
# ]

resort_list = [
    "Heavenly Mountain Resort",
    "Kirkwood Mountain Resort",
    "Northstar at Tahoe Resort"
]

# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def sanitize_filename(filename: str) -> str:
    """
    Convert a string to a safe filename by replacing invalid characters with underscore.
    """
    # Replace any character that isn't alphanumeric, dash, or underscore with underscore
    safe_name = re.sub(r'[^a-zA-Z0-9\-_]', '_', filename)
    # Replace multiple consecutive underscores with a single one
    safe_name = re.sub(r'_+', '_', safe_name)
    # Remove leading/trailing underscores
    safe_name = safe_name.strip('_')
    return safe_name or 'unnamed'

def write_resort_features(resort_name: str, features: list, output_dir: str) -> None:
    """Write features to a resort-specific file or append to existing file."""
    if not features:
        return
        
    safe_name = sanitize_filename(resort_name)
    output_file = Path(output_dir) / f"{safe_name}_runs.json"
    
    # Check if file exists and load existing features
    existing_features = []
    if output_file.exists():
        with open(output_file, 'r', encoding='utf-8') as input_f:
            try:
                existing_data = json.load(input_f)
                existing_features = existing_data.get('features', [])
            except json.JSONDecodeError:
                print(f"Warning: Could not read existing file {output_file}, creating new one")
    
    # Combine existing and new features
    all_features = existing_features + features
    
    # Write combined features back to file
    with open(output_file, 'w', encoding='utf-8') as output_f:
        output_data = {
            "type": "FeatureCollection",
            "features": all_features
        }
        json.dump(output_data, output_f, cls=DecimalEncoder, indent=2)
    
    print(f"Wrote {len(features)} new runs (total: {len(all_features)}) to {output_file}")

def process_runs_by_resort(input_file: str, output_dir: str = None) -> None:
    """
    Process ski runs from a large JSON file and create separate files for each resort.
    Takes advantage of runs being grouped by resort in the input file.
    """
    # Set up output directory
    if output_dir is None:
        output_dir = str(Path(input_file).parent)
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    try:
        current_resort = None
        current_features = []
        total_features = 0
        resort_count = 0

        line_count = 0
        
        # Open and process input file
        with open(input_file, 'r', encoding='utf-8') as input_f:
            print("Processing JSON file...")
            
            # Read the opening of the file
            while True and line_count < 100:
                line_count += 1
                line = input_f.readline()
                if '"features": [' in line:
                    break
            
            # Process features one at a time
            while True:
                line = input_f.readline()
                if not line or line.strip() == ']':  # End of features array
                    break
                
                # Handle feature separator
                if line.strip() == ',':
                    continue
                
                # Accumulate lines until we have a complete feature
                feature_lines = [line]
                bracket_count = line.count('{') - line.count('}')
                while bracket_count > 0:
                    line = input_f.readline()
                    feature_lines.append(line)
                    bracket_count += line.count('{') - line.count('}')
                
                # Parse the complete feature
                try:
                    feature = json.loads(''.join(feature_lines))
                except json.JSONDecodeError:
                    continue  # Skip invalid features
                
                # Get resort name from feature
                properties = feature.get('properties', {})
                ski_areas = properties.get('skiAreas', [])
                resort_name = None
                
                if ski_areas:
                    area_properties = ski_areas[0].get('properties', {})
                    resort_name = area_properties.get('name')
                    if resort_name not in resort_list:
                        continue
                
                # If we've moved to a new resort, write the current one
                if resort_name != current_resort and current_resort is not None:
                    write_resort_features(current_resort, current_features, output_dir)
                    current_features = []
                    resort_count += 1
                    print(f"Processing {resort_name} ...")
                
                # Update current resort and add feature
                if resort_name:
                    current_resort = resort_name
                    current_features.append(feature)
                    total_features += 1
                    
                    if total_features % 1000 == 0:
                        print(f"Processed {total_features} features...", end='\r')
            
            # Write the last resort's features
            if current_resort and current_features:
                write_resort_features(current_resort, current_features, output_dir)
                resort_count += 1
            
            print(f"\nProcessed {total_features} total features across {resort_count} resorts")
                
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found")
    except Exception as e:
        print(f"Error processing file: {e}")

def main():
    # Check command line arguments
    if len(sys.argv) < 2:
        print("Usage: python script.py <json_file> [output_directory]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    process_runs_by_resort(input_file, output_dir)

if __name__ == "__main__":
    main()