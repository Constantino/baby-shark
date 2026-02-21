import urllib.request
import urllib.error
import os
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    api_url = os.environ.get("API_URL", "")
    url = f"{api_url}/api/check"

    logger.info(f"Calling {url}")

    try:
        req = urllib.request.urlopen(url, timeout=10)
        body = req.read().decode("utf-8")
        logger.info(f"Response status: {req.status} body: {body}")
        return {"statusCode": req.status, "body": body}
    except urllib.error.URLError as e:
        logger.error(f"Request failed: {e.reason}")
        return {"statusCode": 500, "body": str(e.reason)}
