#!/usr/bin/bash 

###############################################################################
# BASH BUILD/DEPLOY FUNCTIONS 
###############################################################################

### Source the build.env for user env vars
if [ -f build.env ] ; then 
  . build.env
fi 

# Generate the JSON array of song names using jq, and write it to the output file
function generate_songs_json() { 
  local json_content=$(jq -n --argjson songs "$(printf '%s\n' "$SONGS_DIR"/*.mp3 | xargs -n 1 basename | sed 's/\.mp3$//' | jq -R . | jq -s .)" '{"songs": $songs}')
  echo "$json_content" > $SONGS_JSON
}

# Sync the local files to an s3 bucket
function aws_s3_sync() {
  local s3_bucket="s3://${SITE_NAME}"
  aws s3 sync . "$s3_bucket" --exclude ".git/*"
}

# Use the generate_songs_json() and aws_s3_sync() functions to build and deploy the site
function deploy_site() { 
  local site=$1
  local start_dir="$(pwd)"
  unset_env
  cd $WEB_ROOT_DIR/$site && . build.env
  generate_songs_json
  aws_s3_sync
  cd $start_dir
}

# Main wrapper function to build and deploy 
function deploy {
  depoy_site $SITE_NAME
}
