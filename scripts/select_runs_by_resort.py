import json
import sys
from typing import Iterator, Dict
from pathlib import Path
from decimal import Decimal

# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def stream_runs_by_resort(input_file: str, resort_name: str, output_file: str = None) -> None:
    """
    Stream and filter ski runs from a large JSON file by resort name.
    
    Args:
        input_file (str): Path to input JSON file
        resort_name (str): Name of the resort to filter by
        output_file (str, optional): Path to output JSON file. If None, will use 'filtered_{input_file}'
    """
    # Set default output file name if none provided
    if output_file is None:
        input_path = Path(input_file)
        output_file = str(input_path.parent / f"filtered_{input_path.name}")
    
    try:
        # Open input file for streaming with UTF-8 encoding
        with open(input_file, 'r', encoding='utf-8') as input_f:
            # Open output file and write the start of the JSON structure
            with open(output_file, 'w', encoding='utf-8') as output_f:
                output_f.write('{"type": "FeatureCollection", "features": [\n')
                
                # Load and parse JSON in chunks
                data = json.load(input_f)
                features = data.get('features', [])
                
                first_feature = True
                feature_count = 0
                
                # Process features one at a time
                for feature in features:
                    properties = feature.get('properties', {})
                    ski_areas = properties.get('skiAreas', [])
                    
                    # Check if any of the ski areas match the resort name
                    for area in ski_areas:
                        area_properties = area.get('properties', {})
                        if area_properties.get('name') == resort_name:
                            # Write comma for all but first feature
                            if not first_feature:
                                output_f.write(',\n')
                            else:
                                first_feature = False
                            
                            # Write the matching feature using the custom encoder
                            json.dump(feature, output_f, cls=DecimalEncoder)
                            feature_count += 1
                            
                            # Progress update every 100 matches
                            if feature_count % 100 == 0:
                                print(f"Found {feature_count} matching runs...", end='\r')
                            break
                
                # Close the JSON array and object
                output_f.write('\n]}')
                
                print(f"\nSuccessfully wrote {feature_count} runs to {output_file}")
                
    except FileNotFoundError:
        print(f"Error: Input file '{input_file}' not found")
    except Exception as e:
        print(f"Error processing file: {e}")
        # Clean up partial output file if there was an error
        if output_file and Path(output_file).exists():
            Path(output_file).unlink()

def main():
    # Check command line arguments
    if len(sys.argv) < 3:
        print("Usage: python script.py <json_file> <resort_name> [output_file]")
        sys.exit(1)

    input_file = sys.argv[1]
    resort_name = sys.argv[2]
    output_file = sys.argv[3] if len(sys.argv) > 3 else None

    stream_runs_by_resort(input_file, resort_name, output_file)

if __name__ == "__main__":
    main()