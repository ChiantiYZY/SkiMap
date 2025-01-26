#!/bin/bash

# Check if directory is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

directory="$1"

# Check if directory exists
if [ ! -d "$directory" ]; then
    echo "Error: Directory '$directory' does not exist"
    exit 1
fi

# Navigate to directory
cd "$directory" || exit

# Convert filenames
for file in *; do
    if [ -f "$file" ]; then
        # Convert to lowercase and replace spaces with underscores
        newname=$(echo "$file" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
        
        # Only rename if the name is different
        if [ "$file" != "$newname" ]; then
            mv -i "$file" "$newname"
            echo "Renamed: $file -> $newname"
        fi
    fi
done

echo "Conversion complete!" 