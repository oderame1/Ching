#!/bin/bash
# Script to migrate Next.js pages to React Router pages

for file in src/app/**/*.tsx; do
  if [[ "$file" == *"layout.tsx" ]] || [[ "$file" == *"globals.css" ]]; then
    continue
  fi
  
  # Extract page name
  if [[ "$file" == *"page.tsx" ]]; then
    dir=$(dirname "$file")
    page_name=$(basename "$dir")
    
    # Handle special cases
    if [[ "$dir" == *"[id]"* ]]; then
      page_name="EscrowDetail"
    elif [[ "$dir" == *"test-"* ]]; then
      page_name=$(echo "$dir" | sed 's/.*test-\([^/]*\).*/\1/' | sed 's/^./\U&/')
      page_name="Test${page_name^}"
    elif [[ "$page_name" == "page" ]]; then
      if [[ "$dir" == *"app" ]]; then
        page_name="Home"
      else
        page_name=$(basename $(dirname "$dir"))
        page_name="${page_name^}"
      fi
    fi
    
    echo "Would migrate: $file -> src/pages/${page_name}.tsx"
  fi
done
